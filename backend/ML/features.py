def prepare_labels(df):
    df["label"] = df["fraud_type"].map({
        "NORMAL": 0,
        "SUSPICIOUS": 1,
        "HIGH_RISK": 1
    })
    return df.dropna(subset=["label"])

def split_features(df):
    X = df.drop(columns=["upi_id", "fraud_type", "label"])
    y = df["label"]
    return X, y
