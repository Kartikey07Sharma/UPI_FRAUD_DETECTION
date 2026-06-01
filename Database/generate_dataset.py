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

def get_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

# ==================================================
# USERS (CONSISTENT PROFILES)
# ==================================================
TOTAL_NORMAL_USERS = 3000
TOTAL_FRAUD_USERS = 1000

NORMAL_USERS = [f"user{i}@upi" for i in range(1, TOTAL_NORMAL_USERS + 1)]
FRAUD_USERS = [f"fraud{i}@upi" for i in range(1, TOTAL_FRAUD_USERS + 1)]

DEVICES = ["android_1", "android_2", "ios_1", "ios_2"]
LOCATIONS = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Kolkata"]

#  FIX: Assign fixed profile per user
USER_PROFILE = {}

def initialize_user_profiles():
    now = datetime.now()

    for user in NORMAL_USERS:
        USER_PROFILE[user] = {
            "created_date": now.date() - timedelta(days=random.randint(200, 1200)),
            "device": random.choice(DEVICES),
            "location": random.choice(LOCATIONS)
        }

    for user in FRAUD_USERS:
        USER_PROFILE[user] = {
            "created_date": now.date() - timedelta(days=random.randint(30, 400)),
            "device": random.choice(DEVICES),
            "location": random.choice(LOCATIONS)
        }

# ==================================================
# TRANSACTION GENERATOR
# ==================================================
def generate_transaction(upi_id, is_fraud_user):

    now = datetime.now()
    profile = USER_PROFILE[upi_id]

    # TIME PATTERN
    if is_fraud_user:
        tx_timestamp = now - timedelta(seconds=random.randint(1, 600))
    else:
        tx_timestamp = now - timedelta(minutes=random.randint(1, 365 * 24 * 60))

    # AMOUNT
    if is_fraud_user:
        amount = round(random.uniform(30000, 150000), 2)
    else:
        amount = round(random.uniform(10, 20000), 2)

    # STATUS
    if is_fraud_user:
        tx_status = random.choices(
            ["failed", "success"],
            weights=[0.5, 0.5]
        )[0]
    else:
        tx_status = random.choices(
            ["success", "failed"],
            weights=[0.92, 0.08]
        )[0]

    # REFUND
    if is_fraud_user:
        is_refund = 1 if random.random() < 0.5 else 0
    else:
        is_refund = 1 if random.random() < 0.02 else 0

    # DEVICE
    if is_fraud_user:
        device_id = random.choice(DEVICES + ["new_device", "unknown_device"])
    else:
        device_id = profile["device"]

    # LOCATION
    if is_fraud_user:
        geo_location = random.choice(["Unknown", "International", profile["location"]])
    else:
        geo_location = profile["location"]

    # FRAUD LABEL (VERY IMPORTANT FIX)
    if is_fraud_user:
        is_fraud_txn = 1 if random.random() < 0.6 else 0   # 🔥 stronger fraud signal
    else:
        is_fraud_txn = 1 if random.random() < 0.001 else 0

    return (
        upi_id,
        tx_timestamp,
        amount,
        tx_status,
        is_refund,
        device_id,
        geo_location,
        profile["created_date"],
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

    TARGET_TOTAL_TXNS = 150000
    TARGET_NORMAL_TXNS = int(TARGET_TOTAL_TXNS * 0.75)
    TARGET_FRAUD_TXNS = int(TARGET_TOTAL_TXNS * 0.25)

    batch = []

    # NORMAL
    for _ in range(TARGET_NORMAL_TXNS):
        user = random.choice(NORMAL_USERS)
        batch.append(generate_transaction(user, False))

    # FRAUD
    for _ in range(TARGET_FRAUD_TXNS):
        user = random.choice(FRAUD_USERS)
        batch.append(generate_transaction(user, True))

    random.shuffle(batch)

    # BATCH INSERT
    batch_size = 5000

    for i in range(0, len(batch), batch_size):
        chunk = batch[i:i + batch_size]
        cursor.executemany(insert_query, chunk)
        conn.commit()
        print(f"Inserted {i + len(chunk)} / {len(batch)}")

    print(f"\nTotal Inserted {len(batch)} transactions")

    cursor.close()
    conn.close()

# ==================================================
# ENTRY POINT
# ==================================================
if __name__ == "__main__":
    initialize_user_profiles()   #  IMPORTANT
    insert_transactions()