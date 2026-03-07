import mysql.connector

def get_test_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Kartikey@123",
        database="upi_fraud_test_db"
    )