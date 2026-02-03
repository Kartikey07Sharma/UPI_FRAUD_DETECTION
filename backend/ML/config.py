# config.py

# -------------------------------
# Database configuration
# -------------------------------
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Kartikey@123"  # your MySQL password
DB_NAME = "upi_fraud_db"
DB_PORT = 3306

# Correct DATABASE_URI for SQLAlchemy / MySQL Connector
# @ in password must be URL-encoded as %40
DATABASE_URI = "mysql+mysqlconnector://root:Kartikey%40123@localhost/upi_fraud_db"


# -------------------------------
# Model configuration
# -------------------------------
MODEL_VERSION = "v2"
MODEL_PATH = f"upi_fraud_model_{MODEL_VERSION}.joblib"
PREPROCESSOR_PATH = f"upi_preprocessor_{MODEL_VERSION}.joblib"
FEATURE_SCHEMA_PATH = f"feature_schema_{MODEL_VERSION}.joblib"

# Random seed for reproducibility
RANDOM_STATE = 42
