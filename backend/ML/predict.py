import joblib
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URI, MODEL_PATH, PREPROCESSOR_PATH

THRESHOLD_HIGH = 0.75
THRESHOLD_MED = 0.4

def load_profiles():
    engine = create_engine(DATABASE_URI)
    query = """
    SELECT
        profile_id,
        account_age_days,
        txn_count_day,
        avg_txn_amount,
        failed_txn_ratio,
        refund_ratio,
        device_switch_ratio,
        geo_switch_ratio
    FROM user_profiles
    """
    return pd.read_sql(query, engine)

def assign_label(prob):
    if prob >= THRESHOLD_HIGH:
        return "HIGH_RISK"
    if prob >= THRESHOLD_MED:
        return "SUSPICIOUS"
    return "NORMAL"

def main():
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)

    df = load_profiles()
    features = df.drop(columns=["profile_id"])

    X = preprocessor.transform(features)
    probs = model.predict_proba(X)[:, 1]

    df["fraud_probability"] = probs
    df["fraud_type"] = df["fraud_probability"].apply(assign_label)

    engine = create_engine(DATABASE_URI)
    with engine.begin() as conn:
        for _, r in df.iterrows():
            conn.execute(
                """
                UPDATE user_profiles
                SET fraud_probability = %s,
                    fraud_type = %s,
                    last_updated = NOW()
                WHERE profile_id = %s
                """,
                (float(r.fraud_probability), r.fraud_type, int(r.profile_id))
            )

    print("ML inference complete.")

if __name__ == "__main__":
    main()
