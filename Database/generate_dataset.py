import mysql.connector
import random
from datetime import datetime, timedelta

# ==================================================
# DATABASE CONFIG
# ==================================================
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Kartikey@123",
    "database": "upi_fraud_db",
    "port": 3306
}

# ==================================================
# CONNECTION
# ==================================================
def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ==================================================
# USERS
# ==================================================
NORMAL_USERS = [f"user{i}@upi" for i in range(1, 941)]
FRAUD_USERS = [f"fraud{i}@upi" for i in range(1, 61)]

DEVICES = ["android_1", "android_2", "ios_1", "ios_2"]
LOCATIONS = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Kolkata"]

# ==================================================
# TRANSACTION GENERATOR
# ==================================================
def generate_transaction(upi_id, is_fraud_user):

    upi_created_date = datetime.now().date() - timedelta(
        days=random.randint(30, 1200)
    )

    tx_timestamp = datetime.now() - timedelta(
    minutes=random.randint(1, 365 * 24 * 60)
)

    # ----------------------------
    # Amount distribution overlap
    # ----------------------------
    if is_fraud_user:
        amount = round(random.uniform(1000, 90000), 2)
    else:
        amount = round(random.uniform(10, 60000), 2)

    # ----------------------------
    # Transaction status
    # ----------------------------
    if is_fraud_user:
        tx_status = random.choices(
            ["failed", "success", "pending"],
            weights=[0.35, 0.55, 0.10]
        )[0]
    else:
        tx_status = random.choices(
            ["success", "failed", "pending"],
            weights=[0.85, 0.10, 0.05]
        )[0]

    # ----------------------------
    # Refund behavior
    # ----------------------------
    if is_fraud_user:
        is_refund = 1 if random.random() < 0.25 else 0
    else:
        is_refund = 1 if random.random() < 0.05 else 0

    # ----------------------------
    # Device switching
    # ----------------------------
    if is_fraud_user and random.random() < 0.30:
        device_id = "new_device"
    else:
        device_id = random.choice(DEVICES)

    # ----------------------------
    # Location switching
    # ----------------------------
    if is_fraud_user and random.random() < 0.25:
        geo_location = "Unknown"
    else:
        geo_location = random.choice(LOCATIONS)

    # ----------------------------
    # Fraud probability
    # ----------------------------
    if is_fraud_user:
        is_fraud_txn = 1 if random.random() < 0.15 else 0
    else:
        is_fraud_txn = 1 if random.random() < 0.01 else 0

    return (
        upi_id,
        tx_timestamp,
        amount,
        tx_status,
        is_refund,
        device_id,
        geo_location,
        upi_created_date,
        is_fraud_txn
    )

# ==================================================
# INSERT TRANSACTIONS
# ==================================================
def insert_transactions():

    conn = get_connection()
    cursor = conn.cursor()

    insert_query = """
        INSERT INTO transactions (
            upi_id,
            tx_timestamp,
            amount,
            tx_status,
            is_refund,
            device_id,
            geo_location,
            upi_created_date,
            is_fraud_txn
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    batch = []

    # Normal users (~160–180 transactions)
    for user in NORMAL_USERS:
        for _ in range(random.randint(160, 180)):
            batch.append(generate_transaction(user, False))

    # Fraud users (~550–650 transactions)
    for user in FRAUD_USERS:
        for _ in range(random.randint(550, 650)):
            batch.append(generate_transaction(user, True))

    random.shuffle(batch)

    cursor.executemany(insert_query, batch)
    conn.commit()

    print(f"Inserted {len(batch)} transactions")

    cursor.close()
    conn.close()

# ==================================================
# ENTRY POINT
# ==================================================
if __name__ == "__main__":
    insert_transactions()