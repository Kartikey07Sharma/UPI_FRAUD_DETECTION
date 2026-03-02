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

def fetch_dataframe(query):
    conn = get_connection()
    df = pd.read_sql(query, conn)
    conn.close()
    return df

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

    if df.empty:
        print("No transactions found")
        return

    df["tx_timestamp"] = pd.to_datetime(df["tx_timestamp"])
    df["upi_created_date"] = pd.to_datetime(df["upi_created_date"])

    df["window_start"] = df["tx_timestamp"].dt.date
    df["window_end"] = df["tx_timestamp"].dt.date

    conn = get_connection()
    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO user_profiles (
            upi_id,
            window_start,
            window_end,
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
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON DUPLICATE KEY UPDATE
            account_age_days=VALUES(account_age_days),
            days_active=VALUES(days_active),
            txn_count_day=VALUES(txn_count_day),
            avg_txn_amount=VALUES(avg_txn_amount),
            failed_txn_ratio=VALUES(failed_txn_ratio),
            refund_ratio=VALUES(refund_ratio),
            device_switch_ratio=VALUES(device_switch_ratio),
            geo_switch_ratio=VALUES(geo_switch_ratio),
            last_updated=NOW()
    """

    count = 0

    for (upi_id, ws, we), g in df.groupby(
        ["upi_id", "window_start", "window_end"]
    ):

        total_txns = len(g)
        days_active = 1

        account_age_days = max(
            (ws - g["upi_created_date"].iloc[0].date()).days, 1
        )

        txn_count_day = round(total_txns / days_active, 4)

        avg_txn_amount = round(g["amount"].mean(), 2)
        failed_txn_ratio = round((g["tx_status"] == "failed").mean(), 4)
        refund_ratio = round(g["is_refund"].mean(), 4)
        device_switch_ratio = round(g["device_id"].nunique() / total_txns, 4)
        geo_switch_ratio = round(g["geo_location"].nunique() / total_txns, 4)

        cursor.execute(
            insert_sql,
            (
                upi_id,
                ws,
                we,
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

        count += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Inserted {count} user profile rows")

if __name__ == "__main__":
    update_all_user_profiles()