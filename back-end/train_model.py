import pandas as pd
import mysql.connector
import sklearn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import joblib
import os

# -----------------------------
# Connect Database
# -----------------------------
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    port=3306,
    user="root",
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)

query = "SELECT * FROM hotel_bookings"
df = pd.read_sql(query, conn)
conn.close()

# -----------------------------
# Remove Leakage Columns
# -----------------------------
df = df.drop(columns=[
    "reservation_status",
    "reservation_status_date",
    "company",
    "agent",
    "adr_clean"
], errors="ignore")

# -----------------------------
# Feature Selection
# -----------------------------
FEATURES_NUMERIC = [
    "lead_time",
    "previous_cancellations",
    "adr",
    "booking_changes",
    "total_of_special_requests",
    "is_repeated_guest",
    "adults",
    "children",
    "stays_in_week_nights",
    "stays_in_weekend_nights",
    "days_in_waiting_list"
]

FEATURES_CATEGORICAL = [
    "deposit_type",
    "market_segment",
    "customer_type",
    "distribution_channel"
]

TARGET = "is_canceled"

# -----------------------------
# Handle Missing Values  
# -----------------------------
df[FEATURES_NUMERIC] = df[FEATURES_NUMERIC].fillna(0)
df[FEATURES_CATEGORICAL] = df[FEATURES_CATEGORICAL].fillna("Unknown")

# -----------------------------
# Encode Categorical Columns
# -----------------------------
encoders = {}

for col in FEATURES_CATEGORICAL:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    encoders[col] = le

# -----------------------------
# Final Dataset
# -----------------------------
X = df[FEATURES_NUMERIC + FEATURES_CATEGORICAL]
y = df[TARGET]

# -----------------------------
# Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42,stratify=y
)

# -----------------------------
# Train Model
# -----------------------------
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# -----------------------------
# Evaluation
# -----------------------------
y_pred = model.predict(X_test)
print("\nModel Accuracy:", model.score(X_test, y_test))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# -----------------------------
# Save Model + Metadata
# -----------------------------
joblib.dump({
    "model": model,
    "features_numeric": FEATURES_NUMERIC,
    "features_categorical": FEATURES_CATEGORICAL,
    "encoders": encoders,
    "sklearn_version": sklearn.__version__},
    "cancellation_model.pkl")

print("\nModel saved successfully!")