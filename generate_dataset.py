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

ALL_USERS = NORMAL_USERS + FRAUD_USERS

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
        minutes=random.randint(1, 60 * 24 * 60)
    )

    if is_fraud_user:
        amount = round(random.uniform(20000, 80000), 2)
        tx_status = random.choices(
            ["failed", "success"],
            weights=[0.6, 0.4]
        )[0]
        is_refund = 1 if random.random() < 0.4 else 0
        device_id = random.choice(DEVICES + ["new_device"])
        geo_location = random.choice(LOCATIONS + ["Unknown"])
    else:
        amount = round(random.uniform(10, 15000), 2)
        tx_status = random.choices(
            ["success", "failed", "pending"],
            weights=[0.9, 0.07, 0.03]
        )[0]
        is_refund = 1 if random.random() < 0.05 else 0
        device_id = random.choice(DEVICES)
        geo_location = random.choice(LOCATIONS)

    return (
        upi_id,
        tx_timestamp,
        amount,
        tx_status,
        is_refund,
        device_id,
        geo_location,
        upi_created_date
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
            upi_created_date
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """

    batch = []

    # Normal users (~90–100 txns each)
    for user in NORMAL_USERS:
        for _ in range(random.randint(90, 100)):
            batch.append(generate_transaction(user, False))

    # Fraud users (~300–400 txns each)
    for user in FRAUD_USERS:
        for _ in range(random.randint(300, 400)):
            batch.append(generate_transaction(user, True))

    random.shuffle(batch)

    cursor.executemany(insert_query, batch)
    conn.commit()

    print(f"✅ Inserted {len(batch)} transactions")

    cursor.close()
    conn.close()

# ==================================================
# ENTRY POINT
# ==================================================
if __name__ == "__main__":
    insert_transactions()
