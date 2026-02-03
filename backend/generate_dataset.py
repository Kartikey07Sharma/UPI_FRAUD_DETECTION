import random
from faker import Faker
import mysql.connector
from datetime import timedelta
from tqdm import tqdm

# ---------------- CONFIG ----------------

MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Kartikey@123',
    'database': 'upi_fraud_db'
}

NUM_UPI_USERS = 1000

fake = Faker("en_IN")

# ---------------- VALID UPI HANDLES (REAL INDIA) ----------------

UPI_HANDLES = [
    # PhonePe
    "@ybl", "@ibl", "@axl",
    # Google Pay
    "@okaxis", "@okicici", "@okhdfcbank", "@okbizaxis",
    # Paytm
    "@paytm", "@pty",
    # BHIM
    "@upi",
    # Banks
    "@sbi", "@hdfcbank", "@icici", "@axisbank",
    "@kotak", "@yesbank", "@idfc", "@idfcfirst"
]

# ---------------- INDIAN LOCATIONS ----------------

INDIAN_LOCATIONS = [
    ("Mumbai", "Maharashtra"), ("Pune", "Maharashtra"), ("Delhi", "Delhi"),
    ("Gurgaon", "Haryana"), ("Noida", "Uttar Pradesh"), ("Lucknow", "Uttar Pradesh"),
    ("Bengaluru", "Karnataka"), ("Chennai", "Tamil Nadu"), ("Hyderabad", "Telangana"),
    ("Kolkata", "West Bengal"), ("Indore", "Madhya Pradesh"), ("Jaipur", "Rajasthan"),
    ("Surat", "Gujarat"), ("Dehradun", "Uttarakhand")
]

# ---------------- ISP/IP RANGES ----------------

ISP_RANGES = [
    "49.36", "49.37", "49.38", "106.51", "122.162",
    "110.224", "117.204", "117.205", "202.83", "125.16"
]

def generate_ip():
    return f"{random.choice(ISP_RANGES)}.{random.randint(0,255)}.{random.randint(0,255)}"

# ---------------- REALISTIC UPI GENERATOR ----------------

def generate_upi_id():
    choice_type = random.choice(["mobile", "name", "fullname"])

    if choice_type == "mobile":
        ident = str(random.randint(6000000000, 9999999999))  # realistic Indian mobile range
    elif choice_type == "name":
        ident = fake.first_name().lower()
    else:
        ident = fake.first_name().lower() + fake.last_name().lower()

    handle = random.choice(UPI_HANDLES)
    return ident + handle

# ---------------- AMOUNT GENERATOR ----------------

def generate_amount():
    return round(random.uniform(50, 20000), 2)

# ---------------- USER CREATION ----------------

def create_upi_users():
    users = []
    for _ in range(NUM_UPI_USERS):
        city, state = random.choice(INDIAN_LOCATIONS)
        users.append({
            "upi_id": generate_upi_id(),
            "city": city,
            "state": state,
            "ip": generate_ip(),
            "upi_created": fake.date_between(start_date="-2y", end_date="-6M")
        })
    return users

# ---------------- TRANSACTION GENERATION ----------------

def generate_transactions(user):
    txns = []
    current = user["upi_created"] + timedelta(days=random.randint(1, 120))

    for _ in range(random.randint(10, 250)):
        current += timedelta(hours=random.randint(1, 24))
        txns.append((
            user["upi_id"],
            current,
            generate_amount(),
            random.choice(["success", "failed", "pending"]),
            1 if random.random() < 0.08 else 0,
            f"{user['city']}, {user['state']}",
            user["ip"] if random.random() > 0.1 else generate_ip(),
            user["upi_created"]
        ))
    return txns

# ---------------- MAIN ----------------

def main():
    users = create_upi_users()

    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()

    all_txns = []

    for user in tqdm(users):
        all_txns.extend(generate_transactions(user))

    cursor.executemany(
        """INSERT INTO transactions
        (upi_id, tx_timestamp, amount, tx_status, is_refund, geo_location, device_id, upi_created_date)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
        all_txns
    )

    conn.commit()
    print(f"Inserted {len(all_txns)} realistic transactions successfully!")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
