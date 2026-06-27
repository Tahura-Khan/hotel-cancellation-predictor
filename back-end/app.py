from flask import Flask, render_template, jsonify, request
import mysql.connector
import math
import pandas as pd
import joblib
import os

app = Flask(__name__)

# MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=3306,
        user="root",
        password=os.getenv("MYSQL_ROOT_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/data")
def get_data():

    # Get page number from frontend (default = 1)
    page = request.args.get("page", 1, type=int)
    per_page = 100

    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get total rows count
    cursor.execute("SELECT COUNT(*) as total FROM hotel_bookings")
    total_rows = cursor.fetchone()["total"]

    # Fetch paginated rows
    query = "SELECT * FROM hotel_bookings LIMIT %s OFFSET %s"
    cursor.execute(query, (per_page, offset))
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    total_pages = math.ceil(total_rows / per_page)

    return jsonify({
        "data": rows,
        "total_rows": total_rows,
        "total_pages": total_pages,
        "current_page": page
    })
#usecase1
@app.route("/usecase1")
def usecase1():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Bookings per month
    cursor.execute("""
        SELECT arrival_date_month AS month, COUNT(*) AS total_bookings
        FROM hotel_bookings
        GROUP BY arrival_date_month
    """)
    bookings = cursor.fetchall()

    # Cancellation count
    cursor.execute("""
        SELECT is_canceled, COUNT(*) AS total
        FROM hotel_bookings
        GROUP BY is_canceled
    """)
    cancellations = cursor.fetchall()

    # Average ADR by month
    cursor.execute("""
        SELECT arrival_date_month AS month, AVG(adr) AS avg_adr
        FROM hotel_bookings
        GROUP BY arrival_date_month
    """)
    adr = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "bookings": bookings,
        "cancellations": cancellations,
        "adr": adr
    })

# ==============================
# USECASE 2 - MODEL LOAD
# ==============================

MODEL_PATH = "cancellation_model.pkl"

model = None
FEATURES_NUMERIC = []
FEATURES_CATEGORICAL = []
encoders = {}

if os.path.exists(MODEL_PATH):
    model_data = joblib.load(MODEL_PATH)
    model = model_data["model"]
    FEATURES_NUMERIC = model_data["features_numeric"]
    FEATURES_CATEGORICAL = model_data["features_categorical"]
    encoders = model_data["encoders"]
    print("Model loaded successfully.")
else:
    print("Model not found. Train first.")


# ==============================
# GET DYNAMIC CATEGORIES
# ==============================

@app.route("/get-categories", methods=["GET"])
def get_categories():

    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    categories = {}

    for col in FEATURES_CATEGORICAL:
        categories[col] = list(encoders[col].classes_)

    return jsonify(categories)


# ==============================
# PREDICTION ROUTE FOR USECASE2
# ==============================

@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.json

    try:
        processed_data = {}

        # Handle numeric features
        for col in FEATURES_NUMERIC:
            if col not in data:
                return jsonify({"error": f"Missing numeric field: {col}"}), 400
            processed_data[col] = float(data[col])

        # Handle categorical features safely
        for col in FEATURES_CATEGORICAL:
            if col not in data:
                return jsonify({"error": f"Missing categorical field: {col}"}), 400

            value = str(data[col])

            if value not in encoders[col].classes_:
                return jsonify({
                    "error": f"Invalid value '{value}' for {col}"
                }), 400

            processed_data[col] = encoders[col].transform([value])[0]

        # Maintain correct feature order
        feature_values = [
            processed_data[f]
            for f in FEATURES_NUMERIC + FEATURES_CATEGORICAL
        ]

        prediction = model.predict([feature_values])[0]
        probability = model.predict_proba([feature_values])[0][1]

        return jsonify({
            "prediction": int(prediction),
            "cancellation_probability": round(float(probability), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ==============================
# usecase3
# ==============================
@app.route("/predict_2", methods=["POST"])
def predict_2():

    data = request.json

    model_data = joblib.load("cancellation_model_2.pkl")
    month = data.get("arrival_date_month")
    model = model_data["model"]
    features = model_data["features"]
    importance = model_data["feature_importance"]

    input_df = pd.DataFrame([data])

    input_df = pd.get_dummies(input_df)

    # match training columns
    input_df = input_df.reindex(columns=features, fill_value=0)

    prediction = model.predict(input_df)[0]

    probability = model.predict_proba(input_df)[0][1]

    # ---------------------------
    # RISK SCORE
    # ---------------------------

    if probability < 0.30:
        risk = "LOW"
    elif probability < 0.60:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    # ---------------------------
    # TOP 3 REASONS
    # ---------------------------

    importance_df = pd.DataFrame(importance)

    top_features = importance_df.sort_values(
        by="importance",
        ascending=False
    ).head(3)["feature"].tolist()

    # ---------------------------
    # CONTEXT-BASED REASONS (NEW)
    # ---------------------------

    context_reasons = []

    if month:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM month_context
            WHERE month_name = %s
        """, (month,))

        context = cursor.fetchone()

        if context:
            if context["season_type"]:
                context_reasons.append(f"It is {context['season_type']} season")

            if context["demand_type"]:
                context_reasons.append(f"This is a {context['demand_type']} demand period affecting booking behavior")

            if context["reason"]:
                context_reasons.append(context["reason"])

    return jsonify({
        "prediction": int(prediction),
        "probability": round(float(probability),2),
        "risk_level": risk,
        "top_reasons": top_features,
        "context_reasons": context_reasons
    })

# ==============================
# usecase4
# ==============================
@app.route("/usecase4")
def usecase4():

    month = request.args.get("month")
    season = request.args.get("season")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    conditions = []
    params = []

    if month and month != "All":
        conditions.append("arrival_date_month = %s")
        params.append(month)

    if season and season != "All":
        conditions.append("season_type LIKE %s")
        params.append(f"%{season}%")

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

    
    # ---------------- DEMAND CHART ----------------
    cursor.execute(f"""
        SELECT demand_type,
               ROUND(AVG(is_canceled),2) AS cancellation_rate
        FROM booking_with_context
        {where_clause}
        GROUP BY demand_type
    """, params)

    demand_data = cursor.fetchall()

    demand_chart = {
        "labels": [d["demand_type"] for d in demand_data],
        "datasets": [{
            "label": "Cancellation Rate",
            "data": [d["cancellation_rate"] for d in demand_data]
        }]
    }

    # NEW: trend chart data
    cursor.execute("""
        SELECT 
            arrival_date_month AS month,
            COUNT(*) AS total_bookings,
            SUM(is_canceled) AS total_cancellations
        FROM hotel_bookings
        GROUP BY arrival_date_month
        ORDER BY FIELD(arrival_date_month, 
            'January','February','March','April','May','June',
            'July','August','September','October','November','December')
    """)

    trend_data = cursor.fetchall()

    trend_chart = {
        "labels": [row["month"] for row in trend_data],
        "bookings": [row["total_bookings"] for row in trend_data],
        "cancellations": [row["total_cancellations"] for row in trend_data]
    }
    # ---------------- SEASON CHART ----------------
    cursor.execute(f"""
        SELECT season_type,
               COUNT(*) AS total_bookings
        FROM booking_with_context
        {where_clause}
        GROUP BY season_type
    """, params)

    season_data = cursor.fetchall()

    season_chart = {
        "labels": [s["season_type"] for s in season_data],
        "datasets": [{
            "label": "Total Bookings",
            "data": [s["total_bookings"] for s in season_data]
        }]
    }

    # ---------------- MONTH CHART ----------------
    cursor.execute(f"""
        SELECT arrival_date_month,
               ROUND(AVG(is_canceled),2) AS cancellation_rate
        FROM booking_with_context
        {where_clause}
        GROUP BY arrival_date_month
    """, params)

    month_data = cursor.fetchall()

    month_chart = {
        "labels": [m["arrival_date_month"] for m in month_data],
        "datasets": [{
            "label": "Cancellation Rate",
            "data": [m["cancellation_rate"] for m in month_data]
        }]
    }

    # ---------------- PEAK CHART ----------------
    cursor.execute(f"""
        SELECT season_type,
               ROUND(AVG(is_canceled),2) AS avg_rate
        FROM booking_with_context
        {where_clause}
        GROUP BY season_type
    """, params)

    peak_data = cursor.fetchall()

    peak_chart = {
        "labels": [p["season_type"] for p in peak_data],
        "datasets": [{
            "data": [p["avg_rate"] for p in peak_data]
        }]
    }

    cursor.close()
    conn.close()

    return jsonify({
        "demand_chart": demand_chart,
        "trend_chart": trend_chart, 
        "season_chart": season_chart,
        "month_chart": month_chart,
        "peak_chart": peak_chart
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
