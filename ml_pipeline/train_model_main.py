import pandas as pd
import joblib
import os
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score, classification_report
from ml_pipeline.db import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_xgb.joblib")

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

BEST_THRESHOLD = 0.4  # Chosen after evaluation

def train():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM user_profiles", conn)
    conn.close()

    # Time-based sorting
    df["window_start"] = pd.to_datetime(df["window_start"])
    df = df.sort_values("window_start")

    X = df[FEATURE_COLS]
    y = df["is_fraud"]

    # Time-based split
    split = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]

    # Handle class imbalance
    fraud_count = y_train.sum()
    non_fraud_count = len(y_train) - fraud_count
    scale_pos_weight = non_fraud_count / fraud_count

    # Final tuned XGBoost model
    model = XGBClassifier(
        n_estimators=500,
        max_depth=7,
        learning_rate=0.03,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42
    )

    model.fit(X_train, y_train)

    # Evaluate
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob > BEST_THRESHOLD).astype(int)

    print("ROC-AUC:", roc_auc_score(y_test, y_prob))
    print(f"\nEvaluation at threshold = {BEST_THRESHOLD}")
    print(classification_report(y_test, y_pred))

    # Save model
    joblib.dump(model, MODEL_PATH)
    print("\nModel saved at:", MODEL_PATH)

if __name__ == "__main__":
    train()