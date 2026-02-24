import joblib
import pandas as pd
import os
from datetime import timedelta
from ml_pipeline.db import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model.joblib")

THRESHOLD = 0.6

# 🔑 MUST MATCH train_model.py
FEATURE_COLS = [
    "account_age_days",
    "days_active",
    "txn_count_day",
    "avg_txn_amount",
    "failed_txn_ratio",
    "refund_ratio",
    "device_switch_ratio",
    "geo_switch_ratio"
]

def predict(receiver_upi, amount, current_time, current_location):
    conn = get_connection()
    model = joblib.load(MODEL_PATH)

    # 🔹 Load user profile
    profile = pd.read_sql(
        "SELECT * FROM user_profiles WHERE upi_id=%s",
        conn,
        params=(receiver_upi,)
    )

    if profile.empty:
        conn.close()
        return {
            "fraud_score": 0.7,
            "flagged": True,
            "reasons": ["No historical data"]
        }

    # ✅ Use EXACT same features as training
    X = profile[FEATURE_COLS]
    fraud_score = model.predict_proba(X)[0][1]
    reasons = []

    # 🔹 Rule-based checks using transaction history
    history = pd.read_sql(
        "SELECT * FROM transactions WHERE upi_id=%s",
        conn,
        params=(receiver_upi,)
    )

    if not history.empty:
        # High amount anomaly
        if amount > history["amount"].max() * 3:
            fraud_score = max(fraud_score, 0.85)
            reasons.append("Unusually high transaction amount")

        # High velocity anomaly
        recent = history[
            pd.to_datetime(history["tx_timestamp"]) >
            current_time - timedelta(minutes=10)
        ]

        if len(recent) >= 4:
            fraud_score = max(fraud_score, 0.8)
            reasons.append("High transaction velocity")

    conn.close()

    return {
        "fraud_score": round(float(fraud_score), 3),
        "flagged": fraud_score > THRESHOLD,
        "reasons": reasons
    }