import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URI

def load_user_profiles():
    engine = create_engine(DATABASE_URI)
    query = """
    SELECT
        upi_id,
        account_age_days,
        txn_count_day,
        avg_txn_amount,
        failed_txn_ratio,
        refund_ratio,
        device_switch_ratio,
        geo_switch_ratio,
        fraud_type
    FROM user_profiles
    WHERE fraud_type IS NOT NULL
    """
    return pd.read_sql(query, engine)
