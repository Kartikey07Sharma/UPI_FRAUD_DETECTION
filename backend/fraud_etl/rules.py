#Fraud logic
def apply_fraud_rules(df):
    fraud_type = []
    fraud_prob = []

    for _, r in df.iterrows():
        score = 0

        if r["failed_txn_ratio"] > 0.35: score += 0.3
        if r["device_switch_ratio"] > 0.25: score += 0.3
        if r["geo_switch_ratio"] > 0.30: score += 0.3
        if r["txn_count_day"] > 20: score += 0.2

        prob = min(score, 0.99)

        fraud_prob.append(round(prob, 4))
        fraud_type.append(
            "HIGH_RISK" if prob > 0.7 else
            "SUSPICIOUS" if prob > 0.4 else
            "NORMAL"
        )

    df["fraud_type"] = fraud_type
    df["fraud_probability"] = fraud_prob
    return df
