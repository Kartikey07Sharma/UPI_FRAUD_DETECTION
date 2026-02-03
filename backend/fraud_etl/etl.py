# Extract + Transform + Load
import mysql.connector
import pandas as pd
from datetime import datetime
from config import DB_CONFIG

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def load_transactions():
    conn = get_connection()
    query = """
    SELECT
        upi_id,
        upi_created_date,
        tx_timestamp,
        amount,
        tx_status,
        is_refund,
        device_id,
        geo_location
    FROM transactions
    """
    df = pd.read_sql(query, conn)
    conn.close()

    df["tx_timestamp"] = pd.to_datetime(df["tx_timestamp"])
    df["upi_created_date"] = pd.to_datetime(df["upi_created_date"]).dt.date
    df["tx_date"] = df["tx_timestamp"].dt.date
    return df

def build_user_profiles(df):
    profiles = []

    for upi_id, g in df.groupby("upi_id"):
        total_txns = len(g)
        active_days = g["tx_date"].nunique()

        profiles.append({
            "upi_id": upi_id,
            "account_age_days": (datetime.now().date() - g["upi_created_date"].iloc[0]).days,
            "days_active": active_days,
            "txn_count_day": round(total_txns / max(active_days, 1), 4),
            "avg_txn_amount": round(g["amount"].mean(), 2),
            "failed_txn_ratio": round((g["tx_status"] == "FAILED").sum() / total_txns, 4),
            "refund_ratio": round(g["is_refund"].sum() / total_txns, 4),
            "device_switch_ratio": round(g["device_id"].nunique() / total_txns, 4),
            "geo_switch_ratio": round(g["geo_location"].nunique() / total_txns, 4)
        })

    return pd.DataFrame(profiles)

def upsert_user_profiles(df):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO user_profiles (
        upi_id, account_age_days, days_active, txn_count_day,
        avg_txn_amount, failed_txn_ratio, refund_ratio,
        device_switch_ratio, geo_switch_ratio,
        fraud_type, fraud_probability, last_updated
    )
    VALUES (
        %(upi_id)s, %(account_age_days)s, %(days_active)s, %(txn_count_day)s,
        %(avg_txn_amount)s, %(failed_txn_ratio)s, %(refund_ratio)s,
        %(device_switch_ratio)s, %(geo_switch_ratio)s,
        %(fraud_type)s, %(fraud_probability)s, NOW()
    )
    ON DUPLICATE KEY UPDATE
        account_age_days = VALUES(account_age_days),
        days_active = VALUES(days_active),
        txn_count_day = VALUES(txn_count_day),
        avg_txn_amount = VALUES(avg_txn_amount),
        failed_txn_ratio = VALUES(failed_txn_ratio),
        refund_ratio = VALUES(refund_ratio),
        device_switch_ratio = VALUES(device_switch_ratio),
        geo_switch_ratio = VALUES(geo_switch_ratio),
        fraud_type = VALUES(fraud_type),
        fraud_probability = VALUES(fraud_probability),
        last_updated = NOW();
    """

    for _, row in df.iterrows():
        cursor.execute(query, row.to_dict())

    conn.commit()
    cursor.close()
    conn.close()
