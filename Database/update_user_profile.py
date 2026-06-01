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
            upi_created_date,
            is_fraud_txn
        FROM transactions
    """)

    if df.empty:
        print("No transactions found")
        return

    df["tx_timestamp"] = pd.to_datetime(df["tx_timestamp"])
    df["upi_created_date"] = pd.to_datetime(df["upi_created_date"])

    df["window_start"] = df["tx_timestamp"].dt.to_period("W").apply(lambda r: r.start_time.date())
    df["window_end"] = df["tx_timestamp"].dt.to_period("W").apply(lambda r: r.end_time.date())

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
            max_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            avg_txn_time_gap,
            night_txn_ratio,
            burst_txn_count,
            amount_std,
            high_value_ratio,
            failed_burst,
            txn_density,
            is_fraud,
            last_updated
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON DUPLICATE KEY UPDATE
            account_age_days=VALUES(account_age_days),
            days_active=VALUES(days_active),
            txn_count_day=VALUES(txn_count_day),
            avg_txn_amount=VALUES(avg_txn_amount),
            max_txn_amount=VALUES(max_txn_amount),
            failed_txn_ratio=VALUES(failed_txn_ratio),
            refund_ratio=VALUES(refund_ratio),
            device_switch_ratio=VALUES(device_switch_ratio),
            geo_switch_ratio=VALUES(geo_switch_ratio),
            avg_txn_time_gap=VALUES(avg_txn_time_gap),
            night_txn_ratio=VALUES(night_txn_ratio),
            burst_txn_count=VALUES(burst_txn_count),
            amount_std=VALUES(amount_std),
            high_value_ratio=VALUES(high_value_ratio),
            failed_burst=VALUES(failed_burst),
            txn_density=VALUES(txn_density),
            is_fraud=VALUES(is_fraud),
            last_updated=NOW()
    """

    count = 0

    for (upi_id, ws, we), g in df.groupby(["upi_id", "window_start", "window_end"]):

        total_txns = len(g)
        days_active = g["tx_timestamp"].dt.date.nunique()

        # ✅ MINIMAL FIX START
        upi_date = g["upi_created_date"].iloc[0]
        if pd.notna(upi_date):
            account_age_days = max((ws - upi_date.date()).days, 1)
        else:
            account_age_days = 1
        # ✅ MINIMAL FIX END

        txn_count_day = round(total_txns / max(days_active, 1), 4)

        avg_txn_amount = round(g["amount"].mean(), 2)
        max_txn_amount = round(g["amount"].max(), 2)

        failed_txn_ratio = round((g["tx_status"] == "failed").mean(), 4)
        refund_ratio = round(g["is_refund"].mean(), 4)

        device_switch_ratio = round(g["device_id"].nunique() / total_txns, 4)
        geo_switch_ratio = round(g["geo_location"].nunique() / total_txns, 4)

        g_sorted = g.sort_values("tx_timestamp")

        if len(g_sorted) > 1:
            time_diffs = g_sorted["tx_timestamp"].diff().dt.total_seconds().dropna()
            avg_txn_time_gap = round(time_diffs.mean(), 2)
        else:
            avg_txn_time_gap = 0

        night_txns = g["tx_timestamp"].dt.hour.apply(lambda x: 1 if 0 <= x <= 5 else 0)
        night_txn_ratio = round(night_txns.mean(), 4)

        burst_count = 0
        if len(g_sorted) > 1:
            diffs = g_sorted["tx_timestamp"].diff().dt.total_seconds().dropna()
            burst_count = int((diffs < 60).sum())

        amount_std = round(g["amount"].std() if len(g) > 1 else 0, 2)
        high_value_ratio = round((g["amount"] > 50000).mean(), 4)

        failed_burst = int(
            ((g["tx_status"] == "failed").astype(int).rolling(3).sum() >= 2).sum()
        )

        duration = (g["tx_timestamp"].max() - g["tx_timestamp"].min()).total_seconds()
        txn_density = round(total_txns / max(duration, 1), 6)

        fraud_ratio = g["is_fraud_txn"].mean()

        is_high_risk = (
            fraud_ratio > 0.4
            or failed_txn_ratio > 0.5
            or device_switch_ratio > 0.6
            or geo_switch_ratio > 0.6
            or night_txn_ratio > 0.5
            or burst_count > 10
        )

        if is_high_risk:
            is_fraud = 1 if random.random() > 0.15 else 0
        else:
            is_fraud = 0 if random.random() > 0.05 else 1

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
                max_txn_amount,
                failed_txn_ratio,
                refund_ratio,
                device_switch_ratio,
                geo_switch_ratio,
                avg_txn_time_gap,
                night_txn_ratio,
                burst_count,
                amount_std,
                high_value_ratio,
                failed_burst,
                txn_density,
                is_fraud
            )
        )

        count += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Inserted {count} user profile rows")


if __name__ == "__main__":
    update_all_user_profiles()