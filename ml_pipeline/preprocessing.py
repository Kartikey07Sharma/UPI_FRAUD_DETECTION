# Dont Need right now
# import pandas as pd
# from db import get_connection


# # def generate_features():
# conn = get_connection()

# # Load raw transactions
# txns = pd.read_sql_query(
#     "SELECT * FROM transactions",
#     conn
# )

# if txns.empty:
#     conn.close()
#     raise RuntimeError("No transactions found.")

# # Explicit datetime parsing (prevents warnings + ensures reliability)
# txns["tx_timestamp"] = pd.to_datetime(
#     txns["tx_timestamp"],
#     format="%Y-%m-%d %H:%M:%S.%f",
#     errors="coerce"
# )

# # Feature engineering (UPI-level aggregation)
# features = (
#     txns.groupby("upi_id")
#     .agg(
#         txn_count=("id", "count"),
#         avg_amount=("amount", "mean"),
#         max_amount=("amount", "max"),
#         failed_txn_ratio=("tx_status", lambda x: (x == "failed").mean()),
#         refund_ratio=("is_refund", "mean"),
#         unique_devices=("device_id", "nunique"),
#         unique_locations=("geo_location", "nunique"),
#         last_txn_time=("tx_timestamp", "max"),
#     )
#     .reset_index()
# )

# # Derived time-based features
# now = pd.Timestamp.now()

# features["days_since_last_txn"] = (
#     (now - features["last_txn_time"]).dt.days
# )

# features["avg_amount"] = features["avg_amount"].round(2)
# features["failed_txn_ratio"] = features["failed_txn_ratio"].round(4)
# features["refund_ratio"] = features["refund_ratio"].round(4)

# # Replace is fine for dev
# features.to_sql(
#     "upi_features",
#     conn,
#     if_exists="replace",
#     index=False
# )

# # Add index for performance
# conn.execute(
#     "CREATE INDEX IF NOT EXISTS idx_upi_features ON upi_features(upi_id)"
# )

# conn.commit()
# conn.close()

# print(f"Generated features for {len(features)} UPI IDs")

from Database.update_user_profile import update_all_user_profiles

def generate_features():
    print("Generating user profile features...")
    update_all_user_profiles()