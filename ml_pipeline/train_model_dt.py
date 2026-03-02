import pandas as pd
import joblib
import os
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, roc_auc_score
from ml_pipeline.db import get_connection

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_dt.joblib")

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

# ================= TRAIN =================
def train():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    if df.empty:
        raise RuntimeError("❌ user_profiles table is empty")

    if "is_fraud" not in df.columns:
        raise RuntimeError("❌ is_fraud column missing")

    # ---------------- SORT BY TIME ----------------
    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start").reset_index(drop=True)

    # ---------------- FEATURES & TARGET ----------------
    X = df[FEATURE_COLS]
    y = df["is_fraud"]

    # ---------------- TIME-BASED SPLIT ----------------
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"🧪 Training samples: {len(X_train)}")
    print(f"🧪 Testing samples : {len(X_test)}")

    # ---------------- MODEL ----------------
    model = DecisionTreeClassifier(
        max_depth=10,
        class_weight="balanced",
        random_state=42
    )

    model.fit(X_train, y_train)

    # ---------------- EVALUATION ----------------
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\n📊 Decision Tree Classification Report:\n")
    print(classification_report(y_test, y_pred))
    print("ROC-AUC:", round(roc_auc_score(y_test, y_prob), 4))

    # ---------------- SAVE MODEL ----------------
    joblib.dump(model, MODEL_PATH)
    print("\n✅ Decision Tree model saved at:")
    print(MODEL_PATH)

if __name__ == "__main__":
    print("🚀 Training Decision Tree using TIME-BASED split...")
    train()