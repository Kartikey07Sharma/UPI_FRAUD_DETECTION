import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Kartikey@123",
        database="upi_fraud_db"
    )