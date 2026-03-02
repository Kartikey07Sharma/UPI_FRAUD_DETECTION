import pandas as pd
import mysql.connector
import random

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Kartikey@123",
    "database": "upi_fraud_db",
    "port": 3306
}

def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

def calculate_risk(row):
    risk = 0.0

    # Behavioral signals
    if row["txn_count_day"] > 20:
        risk += 0.20
    if row["avg_txn_amount"] > 20000:
        risk += 0.25
    if row["failed_txn_ratio"] > 0.30:
        risk += 0.20
    if row["refund_ratio"] > 0.20:
        risk += 0.15
    if row["device_switch_ratio"] > 0.40:
        risk += 0.10
    if row["geo_switch_ratio"] > 0.40:
        risk += 0.10

    return min(risk, 1.0)

def probabilistic_label(risk):
    if risk >= 0.70:
        return 1 if random.random() < 0.65 else 0
    elif risk >= 0.50:
        return 1 if random.random() < 0.35 else 0
    elif risk >= 0.30:
        return 1 if random.random() < 0.15 else 0
    else:
        return 1 if random.random() < 0.02 else 0

def label_user_profiles():

    conn = get_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)

    if df.empty:
        print("user_profiles is empty")
        conn.close()
        return

    labels = []

    for _, row in df.iterrows():
        risk = calculate_risk(row)
        label = probabilistic_label(risk)
        labels.append(label)

    df["is_fraud"] = labels

    cursor = conn.cursor()

    update_sql = """
        UPDATE user_profiles
        SET is_fraud = %s
        WHERE profile_id = %s
    """

    for profile_id, is_fraud in zip(df["profile_id"], df["is_fraud"]):
        cursor.execute(update_sql, (int(is_fraud), int(profile_id)))

    conn.commit()
    cursor.close()
    conn.close()

    fraud_count = df["is_fraud"].sum()
    total = len(df)

    print(f"Labeled {total} profiles")
    print(f"Fraud profiles: {fraud_count} ({fraud_count / total:.2%})")

if __name__ == "__main__":
    label_user_profiles()