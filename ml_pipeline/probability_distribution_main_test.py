import pandas as pd
import joblib
import os
import numpy as np
from scipy.stats import gaussian_kde
from ml_pipeline.db_test import get_test_connection

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ================= MODEL PATHS (MAIN MODEL) =================
XGB_MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb.joblib")
LR_STACK_MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb_lr.joblib")

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

# ================= LOAD TEST DATA =================
def load_test_data():
    conn = get_test_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    if df.empty:
        raise RuntimeError("Test database user_profiles table is empty")

    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start").reset_index(drop=True)

    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:]

    X_test = test_df[FEATURE_COLS]
    y_test = test_df["is_fraud"]

    return X_test, y_test

# ================= PDF + KDE =================
def compute_pdf(probabilities, bins=50):
    hist, bin_edges = np.histogram(
        probabilities, bins=bins, range=(0, 1), density=True
    )
    return hist, bin_edges

def compute_kde(probabilities):
    kde = gaussian_kde(probabilities)
    x = np.linspace(0, 1, 200)
    y = kde(x)
    return x, y

# ================= MAIN MODEL ANALYSIS =================
def analyze_main_model():
    X_test, _ = load_test_data()

    # Load trained main model
    xgb_model = joblib.load(XGB_MODEL_PATH)
    lr_model = joblib.load(LR_STACK_MODEL_PATH)

    # Step 1: XGBoost probability
    xgb_probs = xgb_model.predict_proba(X_test)[:, 1]

    # Step 2: Logistic Regression refinement
    probs = lr_model.predict_proba(
        pd.DataFrame({"xgb_prob": xgb_probs})
    )[:, 1]

    hist, bins = compute_pdf(probs)
    kde_x, kde_y = compute_kde(probs)

    return {
        "model_name": "XGBoost + Logistic Regression (Main Model)",
        "mean": float(np.mean(probs)),
        "std": float(np.std(probs)),
        "hist": hist,
        "bins": bins,
        "kde_x": kde_x,
        "kde_y": kde_y
    }

# ================= RUN =================
if __name__ == "__main__":
    result = analyze_main_model()

    print("\nModel:", result["model_name"])
    print(f"Mean fraud probability: {result['mean']:.4f}")
    print(f"Std dev: {result['std']:.4f}")