import pandas as pd
import uuid
from datetime import datetime, timedelta
from ml_pipeline.db_test import get_test_connection

CSV_PATH = "upi_transactions_2024.csv"

def load_csv():
    df = pd.read_csv(CSV_PATH)

    # -------- column normalization --------
    df.columns = [c.lower() for c in df.columns]

    # expected mappings (handles most Kaggle datasets)
    amount_col = next(c for c in df.columns if "amount" in c)
    time_col = next(c for c in df.columns if "time" in c or "date" in c)
    fraud_col = next(c for c in df.columns if "fraud" in c or "class" in c)

    conn = get_test_connection()
    cursor = conn.cursor()

    for _, row in df.iterrows():
        upi_id = f"user_{uuid.uuid4().hex[:10]}"
        device_id = f"device_{uuid.uuid4().hex[:6]}"
        geo_location = "India"

        tx_time = pd.to_datetime(row[time_col])
        upi_created = tx_time.date() - timedelta(days=180)

        cursor.execute("""
            INSERT INTO transactions (
                upi_id, tx_timestamp, amount, tx_status,
                is_refund, device_id, geo_location, upi_created_date
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            upi_id,
            tx_time,
            float(row[amount_col]),
            "SUCCESS",
            0,
            device_id,
            geo_location,
            upi_created
        ))

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    load_csv()