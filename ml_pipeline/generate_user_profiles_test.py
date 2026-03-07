import pandas as pd
from ml_pipeline.db_test import get_test_connection

def generate_profiles():
    conn = get_test_connection()

    tx = pd.read_sql("SELECT * FROM transactions", conn)
    tx["tx_timestamp"] = pd.to_datetime(tx["tx_timestamp"])

    profiles = []

    for upi_id, g in tx.groupby("upi_id"):
        account_age_days = (g["tx_timestamp"].max().date() - g["upi_created_date"].iloc[0]).days
        days_active = g["tx_timestamp"].dt.date.nunique()
        txn_count_day = len(g) / max(days_active, 1)
        avg_txn_amount = g["amount"].mean()

        failed_txn_ratio = 0.0
        refund_ratio = g["is_refund"].mean()

        device_switch_ratio = g["device_id"].nunique() / len(g)
        geo_switch_ratio = g["geo_location"].nunique() / len(g)

        is_fraud = 1 if avg_txn_amount > 20000 else 0

        profiles.append((
            upi_id,
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            is_fraud,
            g["tx_timestamp"].min()
        ))

    cursor = conn.cursor()
    for p in profiles:
        cursor.execute("""
            INSERT INTO user_profiles (
                upi_id, account_age_days, days_active, txn_count_day,
                avg_txn_amount, failed_txn_ratio, refund_ratio,
                device_switch_ratio, geo_switch_ratio,
                is_fraud, window_start
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, p)

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    generate_profiles()