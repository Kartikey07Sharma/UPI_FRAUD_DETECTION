from etl import load_transactions, build_user_profiles, upsert_user_profiles
from rules import apply_fraud_rules
from alert_generator import generate_alerts

def run():
    tx_df = load_transactions()
    profile_df = build_user_profiles(tx_df)
    profile_df = apply_fraud_rules(profile_df)
    upsert_user_profiles(profile_df)

    # Generate alerts after profile update
    generate_alerts()

if __name__ == "__main__":
    run()
