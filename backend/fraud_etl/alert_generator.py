import mysql.connector
from datetime import datetime, timedelta
from config import DB_CONFIG

ALERT_THRESHOLD = 0.75
ALERT_COOLDOWN_HOURS = 24

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def generate_alerts():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Get high-risk users
    cursor.execute("""
        SELECT upi_id, fraud_probability
        FROM user_profiles
        WHERE fraud_probability >= %s
    """, (ALERT_THRESHOLD,))

    risky_users = cursor.fetchall()

    for user in risky_users:
        upi_id = user["upi_id"]
        prob = user["fraud_probability"]

        # 2. Check for recent alert (cooldown)
        cursor.execute("""
            SELECT alert_time
            FROM fraud_alerts
            WHERE upi_id = %s
            ORDER BY alert_time DESC
            LIMIT 1
        """, (upi_id,))

        last_alert = cursor.fetchone()

        if last_alert:
            last_time = last_alert["alert_time"]
            if datetime.now() - last_time < timedelta(hours=ALERT_COOLDOWN_HOURS):
                continue

        # 3. Insert new alert
        cursor.execute("""
            INSERT INTO fraud_alerts (upi_id, fraud_probability)
            VALUES (%s, %s)
        """, (upi_id, prob))

    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    generate_alerts()