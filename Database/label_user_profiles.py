import pandas as pd
import mysql.connector

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Kartikey@123",
    "database": "upi_fraud_db",
    "port": 3306
}


def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)


def label_user_profiles():

    conn = get_connection()

    df = pd.read_sql("""
        SELECT profile_id,
               txn_count_day,
               avg_txn_amount,
               failed_txn_ratio,
               refund_ratio,
               device_switch_ratio,
               geo_switch_ratio,
               is_fraud
        FROM user_profiles
    """, conn)

    if df.empty:
        print("user_profiles table is empty")
        conn.close()
        return

    updates = []

    for _, row in df.iterrows():

        # Skip rows already labeled as fraud
        if row["is_fraud"] == 1:
            continue

        risk_score = 0

        if row["txn_count_day"] > 20:
            risk_score += 1

        if row["avg_txn_amount"] > 20000:
            risk_score += 1

        if row["failed_txn_ratio"] > 0.30:
            risk_score += 1

        if row["refund_ratio"] > 0.20:
            risk_score += 1

        if row["device_switch_ratio"] > 0.40:
            risk_score += 1

        if row["geo_switch_ratio"] > 0.40:
            risk_score += 1

        # Only label if strong suspicious pattern
        if risk_score >= 4:
            label = 1
        else:
            label = 0

        updates.append((label, int(row["profile_id"])))

    cursor = conn.cursor()

    update_sql = """
        UPDATE user_profiles
        SET is_fraud = %s
        WHERE profile_id = %s
    """

    cursor.executemany(update_sql, updates)

    conn.commit()

    stats = pd.read_sql("""
        SELECT is_fraud, COUNT(*) as count
        FROM user_profiles
        GROUP BY is_fraud
    """, conn)

    print("\nLabel distribution:")
    print(stats)

    cursor.close()
    conn.close()


if __name__ == "__main__":
    label_user_profiles()