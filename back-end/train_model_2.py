import pandas as pd
import mysql.connector
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Connect to MySQL
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    port=3306,
    user="root",
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)

query = """
SELECT 
    h.is_canceled,
    h.lead_time,
    h.previous_cancellations,
    h.previous_bookings_not_canceled,
    h.booking_changes,
    h.deposit_type,
    h.total_of_special_requests,
    a.cancel_rate AS agent_cancel_rate,
    c.cancel_rate AS country_cancel_rate,
    m.cancel_rate AS segment_cancel_rate
FROM hotel_bookings h
LEFT JOIN agent_risk_status a ON h.agent = a.agent
LEFT JOIN country_risk_profile c ON h.country = c.country
LEFT JOIN market_segment_risk m ON h.market_segment = m.market_segment
"""

df = pd.read_sql(query, conn)

df.fillna(0, inplace=True)

X = df.drop("is_canceled", axis=1)
y = df["is_canceled"]

X = pd.get_dummies(X)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

print("Accuracy:", model.score(X_test, y_test))

#feature importance explaination (why cancel occur)
importances = model.feature_importances_
features = X.columns

importance_df = pd.DataFrame({
    "feature": features,
    "importance": importances
}).sort_values(by="importance", ascending=False)

print("\nTop 10 Important Features:")
print(importance_df.head(10))


# ------------------------------
# SAVE MODEL & FEATURES
# ------------------------------
joblib.dump({
    "model": model,
    "features": list(X.columns),
    "feature_importance": importance_df.to_dict()
}, "cancellation_model_2.pkl")

print("\nModel-2 saved successfully")
