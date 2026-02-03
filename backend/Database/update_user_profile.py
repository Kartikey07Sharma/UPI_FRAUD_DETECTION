import pandas as pd
import mysql.connector
from datetime import datetime

# ==================================================
# DATABASE CONFIG
# ==================================================
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Kartikey@123',
    'database': 'upi_fraud_db'
}

# ==================================================
# GET DATABASE CONNECTION
# ==================================================
def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ==================================================
# FETCH DATAFRAME SAFELY (NO PANDAS WARNING)
# ==================================================
def fetch_dataframe(query, params=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return pd.DataFrame(rows)

# ==================================================
# UPDATE PROFILE FOR ONE USER
# ==================================================
def update_single_user_profile(upi_id):

    select_query = """
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
        WHERE upi_id = %s
    """

    df = fetch_dataframe(select_query, (upi_id,))

    if df.empty:
        return

    # ---------------- TIME FEATURES ----------------
    df["tx_timestamp"] = pd.to_datetime(df["tx_timestamp"])
    df["upi_created_date"] = pd.to_datetime(df["upi_created_date"])

    first_txn = df["tx_timestamp"].min()
    last_txn = df["tx_timestamp"].max()

    account_age_days = max(
        (datetime.now() - df["upi_created_date"].iloc[0]).days, 1
    )
    days_active = max((last_txn - first_txn).days + 1, 1)

    # ---------------- TRANSACTION FEATURES ----------------
    total_txns = len(df)

    txn_count_day = round(total_txns / days_active, 4)
    avg_txn_amount = round(df["amount"].mean(), 2)

    failed_txn_ratio = round(
        (df["tx_status"] == "failed").sum() / total_txns, 4
    )

    refund_ratio = round(df["is_refund"].sum() / total_txns, 4)

    device_switch_ratio = round(df["device_id"].nunique() / total_txns, 4)
    geo_switch_ratio = round(df["geo_location"].nunique() / total_txns, 4)

    # ---------------- UPSERT INTO user_profiles ----------------
    upsert_query = """
        INSERT INTO user_profiles (
            upi_id,
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            last_updated
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON DUPLICATE KEY UPDATE
            account_age_days = VALUES(account_age_days),
            days_active = VALUES(days_active),
            txn_count_day = VALUES(txn_count_day),
            avg_txn_amount = VALUES(avg_txn_amount),
            failed_txn_ratio = VALUES(failed_txn_ratio),
            refund_ratio = VALUES(refund_ratio),
            device_switch_ratio = VALUES(device_switch_ratio),
            geo_switch_ratio = VALUES(geo_switch_ratio),
            last_updated = NOW()
    """

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        upsert_query,
        (
            upi_id,
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio
        )
    )
    conn.commit()
    cursor.close()
    conn.close()

# ==================================================
# UPDATE ALL USERS
# ==================================================
def update_all_user_profiles():
    df_users = fetch_dataframe("SELECT DISTINCT upi_id FROM transactions")

    upi_ids = df_users["upi_id"].tolist()

    print(f"🔄 Found {len(upi_ids)} users. Updating profiles...")

    for upi_id in upi_ids:
        update_single_user_profile(upi_id)

    print("✅ user_profiles table updated successfully")

# ==================================================
# ENTRY POINT
# ==================================================
if __name__ == "__main__":
    update_all_user_profiles()
