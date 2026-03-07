import pandas as pd
import joblib
import os
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score
from ml_pipeline.db import get_connection

# ================= MODEL NAME =================
MODEL_NAME = "SVM (RBF Kernel)"

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_svm.joblib")

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

# ================= CONFIG =================
# Limit training size for SVM (important for performance)
MAX_TRAIN_SAMPLES = 15000

# ================= TRAIN =================
def train():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    if df.empty:
        raise RuntimeError("user_profiles table is empty")

    if "is_fraud" not in df.columns:
        raise RuntimeError("is_fraud column missing")

    # ---------------- SORT BY TIME ----------------
    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start").reset_index(drop=True)

    # ---------------- FEATURES & TARGET ----------------
    X = df[FEATURE_COLS]
    y = df["is_fraud"]

    # ---------------- TIME-BASED SPLIT ----------------
    split_idx = int(len(df) * 0.8)

    X_train = X.iloc[:split_idx]
    y_train = y.iloc[:split_idx]
    X_test = X.iloc[split_idx:]
    y_test = y.iloc[split_idx:]

    # ---------------- SUBSAMPLE FOR SVM ----------------
    if len(X_train) > MAX_TRAIN_SAMPLES:
        X_train = X_train.iloc[-MAX_TRAIN_SAMPLES:]
        y_train = y_train.iloc[-MAX_TRAIN_SAMPLES:]

    print(f"Training Model: {MODEL_NAME}")
    print(f"Training samples used: {len(X_train)}")
    print(f"Testing samples       : {len(X_test)}")

    # ---------------- MODEL ----------------
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(
            kernel="rbf",
            C=5.0,
            gamma="scale",
            probability=True,
            class_weight="balanced",
            random_state=42
        ))
    ])

    model.fit(X_train, y_train)

    # ---------------- EVALUATION ----------------
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\nClassification Report:\n")
    print(classification_report(y_test, y_pred))
    print("ROC-AUC:", round(roc_auc_score(y_test, y_prob), 4))

    # ---------------- SAVE MODEL ----------------
    joblib.dump(model, MODEL_PATH)
    print("\nModel trained and saved at:")
    print(MODEL_PATH)

# ================= ENTRY =================
if __name__ == "__main__":
    train()