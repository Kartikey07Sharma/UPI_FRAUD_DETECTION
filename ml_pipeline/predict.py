import joblib
import pandas as pd
import os
from ml_pipeline.db import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_lgbm.joblib")

FEATURE_COLS = [
    "account_age_days",
    "days_active",
    "txn_count_day",
    "avg_txn_amount",
    "failed_txn_ratio",
    "refund_ratio",
    "device_switch_ratio",
    "geo_switch_ratio",
    "avg_txn_time_gap"
]

model = None


def load_model():
    global model
    if model is None:
        model = joblib.load(MODEL_PATH)


def predict(upi_id):

    load_model()

    conn = get_connection()

    df = pd.read_sql(
        """
        SELECT
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            avg_txn_time_gap,
            window_start
        FROM user_profiles
        WHERE upi_id = %s
        ORDER BY window_start DESC
        LIMIT 1
        """,
        conn,
        params=(upi_id,)
    )

    if df.empty:
        conn.close()
        return {
            "fraud_score": None,
            "risk_level": "UNKNOWN"
        }

    df = df.fillna(0)

    prob = float(model.predict_proba(df[FEATURE_COLS])[:, 1][0])

    if prob >= 0.7:
        risk = "HIGH"
    elif prob >= 0.4:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    cursor = conn.cursor()

    insert_alert = """
        INSERT INTO fraud_alerts (upi_id, fraud_probability)
        VALUES (%s, %s)
    """

    cursor.execute(insert_alert, (upi_id, prob))
    conn.commit()

    cursor.close()
    conn.close()

    return {
        "fraud_score": round(prob, 3),
        "risk_level": risk
    }


if __name__ == "__main__":
    # Example test
    result = predict("user10@upi")
    print(result)