import pandas as pd
import joblib
import os
import numpy as np
from scipy.stats import gaussian_kde
# from ml_pipeline.db import get_connection
from ml_pipeline.db_test import get_test_connection

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ================= MODEL FILES =================
MODEL_FILES = {
    "rf": "fraud_model_rf.joblib",
    "dt": "fraud_model_dt.joblib",
    "knn": "fraud_model_knn.joblib",
    "lr": "fraud_model_logreg.joblib",
    "svm": "fraud_model_svm.joblib",
    "ada": "fraud_model_adaboost.joblib",
    "xgb": "fraud_model_xgb.joblib"
}

# ================= MODEL NAMES =================
MODEL_NAMES = {
    "rf": "Random Forest",
    "dt": "Decision Tree",
    "knn": "KNN",
    "lr": "Logistic Regression",
    "svm": "SVM (RBF)",
    "ada": "AdaBoost",
    "xgb": "XGBoost",
    "main": "XGBoost + Logistic Regression (Main Model)"
}

# ================= STACKED MODEL PATHS =================
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
    # conn = get_connection()
    conn = get_test_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start").reset_index(drop=True)

    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:]

    X_test = test_df[FEATURE_COLS]
    y_test = test_df["is_fraud"]

    return X_test, y_test

# ================= PDF FUNCTIONS =================
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

# ================= ANALYSIS =================
def analyze_model(model_key):
    X_test, _ = load_test_data()

    # Main stacked model
    if model_key == "main":
        xgb_model = joblib.load(XGB_MODEL_PATH)
        lr_model = joblib.load(LR_STACK_MODEL_PATH)

        xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
        probs = lr_model.predict_proba(
            pd.DataFrame({"xgb_prob": xgb_probs})
        )[:, 1]

    # Single models
    else:
        model_path = os.path.join(BASE_DIR, MODEL_FILES[model_key])
        model = joblib.load(model_path)
        probs = model.predict_proba(X_test)[:, 1]

    hist, bins = compute_pdf(probs)
    kde_x, kde_y = compute_kde(probs)

    return {
        "model_key": model_key,
        "model_name": MODEL_NAMES[model_key],
        "mean": float(np.mean(probs)),
        "std": float(np.std(probs)),
        "hist": hist,
        "bins": bins,
        "kde_x": kde_x,
        "kde_y": kde_y
    }

# ================= RUN ALL MODELS =================
if __name__ == "__main__":
    ALL_MODELS = ["rf", "dt", "knn", "lr", "svm", "ada", "xgb", "main"]

    for model_key in ALL_MODELS:
        result = analyze_model(model_key)
        print(f"\nModel: {result['model_name']}")
        print(f"Mean fraud probability: {result['mean']:.4f}")
        print(f"Std dev: {result['std']:.4f}")