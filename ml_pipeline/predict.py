import joblib
import pandas as pd
import os
from ml_pipeline.db import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb.joblib")

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

def predict(upi_id):

    conn = get_connection()
    df = pd.read_sql(
        """
        SELECT *
        FROM user_profiles
        WHERE upi_id = %s
        ORDER BY window_start DESC
        LIMIT 1
        """,
        conn,
        params=(upi_id,)
    )
    conn.close()

    if df.empty:
        return {
            "fraud_score": None,
            "risk_level": "UNKNOWN"
        }

    model = joblib.load(MODEL_PATH)
    prob = float(model.predict_proba(df[FEATURE_COLS])[:, 1][0])

    # Risk buckets (no hard decision here)
    if prob >= 0.7:
        risk = "HIGH"
    elif prob >= 0.4:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "fraud_score": round(prob, 3),
        "risk_level": risk
    }