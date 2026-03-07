import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
from ml_pipeline.db_test import get_test_connection

# ================= PATHS =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XGB_MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb.joblib")
LR_MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb_lr.joblib")

# ================= FEATURES =================
FEATURE_COLS = [
    "account_age_days",
    "days_active",
    "txn_count_day",
    "avg_txn_amount",
    "failed_txn_ratio",
    "refund_ratio",
    "device_switch_ratio",
    "geo_switch_ratio"
]

def main():
    # ---------------- LOAD TEST DATABASE ----------------
    conn = get_test_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start").reset_index(drop=True)

    # ---------------- TIME-BASED TEST SPLIT ----------------
    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:]

    X_test = test_df[FEATURE_COLS]
    y_test = test_df["is_fraud"].values

    # ---------------- LOAD TRAINED MODELS ----------------
    xgb_model = joblib.load(XGB_MODEL_PATH)
    lr_model = joblib.load(LR_MODEL_PATH)

    # ---------------- PREDICTIONS ----------------
    xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
    final_probs = lr_model.predict_proba(
        pd.DataFrame({"xgb_prob": xgb_probs})
    )[:, 1]

    # ---------------- SPLIT BY CLASS ----------------
    genuine_idx = y_test == 0
    fraud_idx = y_test == 1

    # ---------------- SCATTER PLOT ----------------
    plt.figure()

    plt.scatter(
        test_df.index[genuine_idx],
        final_probs[genuine_idx],
        label="Genuine",
        alpha=0.6
    )

    plt.scatter(
        test_df.index[fraud_idx],
        final_probs[fraud_idx],
        label="Fraud",
        alpha=0.8
    )

    plt.xlabel("Test Samples (Time Ordered)")
    plt.ylabel("Fraud Probability")
    plt.title("Fraud Probability Scatter Plot (Main Model – Test Dataset)")
    plt.legend()
    plt.show()

if __name__ == "__main__":
    main()