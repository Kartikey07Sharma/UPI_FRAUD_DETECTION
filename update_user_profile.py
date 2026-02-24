import pandas as pd
import mysql.connector
import random

# ================= DATABASE CONFIG =================
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Kartikey@123",
    "database": "upi_fraud_db",
    "port": 3306
}

def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

def fetch_dataframe(query):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return pd.DataFrame(rows)

# ================= FRAUD LOGIC (RISK SCORE) =================
def calculate_fraud_probability(row):
    risk = 0.0
    if row["account_age_days"] < 30: risk += 0.20
    if row["txn_count_day"] > 15: risk += 0.25
    if row["avg_txn_amount"] > 20000: risk += 0.20
    if row["failed_txn_ratio"] > 0.30: risk += 0.15
    if row["refund_ratio"] > 0.20: risk += 0.10
    if row["device_switch_ratio"] > 0.40: risk += 0.05
    if row["geo_switch_ratio"] > 0.40: risk += 0.05
    return min(round(risk, 4), 1.0)

def assign_fraud_type(prob):
    if prob >= 0.70:
        return "FRAUD"
    elif prob >= 0.45:
        return "SUSPICIOUS"
    elif prob >= 0.20:
        return "CARELESS"
    return "GENUINE"

# ✅ NEW: PROBABILISTIC LABEL (CRITICAL FIX)
def assign_is_fraud(fraud_probability):
    if fraud_probability >= 0.80:
        return 1 if random.random() < 0.65 else 0
    elif fraud_probability >= 0.60:
        return 1 if random.random() < 0.35 else 0
    elif fraud_probability >= 0.40:
        return 1 if random.random() < 0.15 else 0
    else:
        return 1 if random.random() < 0.02 else 0

# ================= MAIN PROFILE GENERATION =================
def update_all_user_profiles():

    df = fetch_dataframe("""
        SELECT
            upi_id,
            tx_timestamp,
            amount,
            tx_status,
            is_refund,
            device_id,
            geo_location,
            upi_created_date
        FROM transactions
    """)

    df["tx_timestamp"] = pd.to_datetime(df["tx_timestamp"])
    df["upi_created_date"] = pd.to_datetime(df["upi_created_date"])

    # DAILY WINDOWS
    df["window_start"] = df["tx_timestamp"].dt.date
    df["window_end"] = df["tx_timestamp"].dt.date

    conn = get_connection()
    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO user_profiles (
            upi_id, window_start, window_end,
            account_age_days, days_active, txn_count_day,
            avg_txn_amount, failed_txn_ratio, refund_ratio,
            device_switch_ratio, geo_switch_ratio,
            fraud_probability, fraud_type, is_fraud, last_updated
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON DUPLICATE KEY UPDATE
            account_age_days=VALUES(account_age_days),
            days_active=VALUES(days_active),
            txn_count_day=VALUES(txn_count_day),
            avg_txn_amount=VALUES(avg_txn_amount),
            failed_txn_ratio=VALUES(failed_txn_ratio),
            refund_ratio=VALUES(refund_ratio),
            device_switch_ratio=VALUES(device_switch_ratio),
            geo_switch_ratio=VALUES(geo_switch_ratio),
            fraud_probability=VALUES(fraud_probability),
            fraud_type=VALUES(fraud_type),
            is_fraud=VALUES(is_fraud),
            last_updated=NOW()
    """

    count = 0

    for (upi_id, ws, we), g in df.groupby(["upi_id", "window_start", "window_end"]):

        if len(g) < 2:
            continue

        days_active = g["tx_timestamp"].dt.date.nunique()
        total_txns = len(g)

        profile = {
            "account_age_days": max(
                (we - g["upi_created_date"].iloc[0].date()).days, 1
            ),
            "days_active": days_active,
            "txn_count_day": round(total_txns / max(days_active, 1), 4),
            "avg_txn_amount": round(g["amount"].mean(), 2),
            "failed_txn_ratio": round((g["tx_status"] == "failed").mean(), 4),
            "refund_ratio": round(g["is_refund"].mean(), 4),
            "device_switch_ratio": round(g["device_id"].nunique() / total_txns, 4),
            "geo_switch_ratio": round(g["geo_location"].nunique() / total_txns, 4),
        }

        fraud_probability = calculate_fraud_probability(profile)
        fraud_type = assign_fraud_type(fraud_probability)
        is_fraud = assign_is_fraud(fraud_probability)  # ✅ FIX

        cursor.execute(
            insert_sql,
            (
                upi_id, ws, we,
                profile["account_age_days"],
                profile["days_active"],
                profile["txn_count_day"],
                profile["avg_txn_amount"],
                profile["failed_txn_ratio"],
                profile["refund_ratio"],
                profile["device_switch_ratio"],
                profile["geo_switch_ratio"],
                fraud_probability,
                fraud_type,
                is_fraud
            )
        )
        count += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"✅ Successfully generated {count} DAILY user profiles")

# ================= ENTRY POINT =================
if __name__ == "__main__":
    update_all_user_profiles()