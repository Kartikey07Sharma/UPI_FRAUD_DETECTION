import pandas as pd
import joblib
import os
import lightgbm as lgb
from sklearn.metrics import roc_auc_score, classification_report
from ml_pipeline.db import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_lgbm.joblib")

FEATURE_COLS = [
    "account_age_days",
    "days_active",
    "txn_count_day",
    "avg_txn_amount",
    "failed_txn_ratio",
    "refund_ratio",
    "device_switch_ratio",
    "geo_switch_ratio",
    "avg_txn_time_gap"
]

BEST_THRESHOLD = 0.4


def train():

    conn = get_connection()

    df = pd.read_sql("""
        SELECT
            upi_id,
            window_start,
            is_fraud,
            account_age_days,
            days_active,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio,
            avg_txn_time_gap
        FROM user_profiles
    """, conn)

    conn.close()

    if df.empty:
        print("user_profiles table is empty")
        return

    print("\nTotal behavioral records:", len(df))

    df["window_start"] = pd.to_datetime(df["window_start"])

    df = df.dropna(subset=FEATURE_COLS + ["is_fraud"])

    # -------------------------------------------------
    # Time based split (better for fraud detection)
    # -------------------------------------------------
    df = df.sort_values("window_start")

    split = int(len(df) * 0.8)

    train_df = df.iloc[:split]
    test_df = df.iloc[split:]

    X_train = train_df[FEATURE_COLS]
    y_train = train_df["is_fraud"]

    X_test = test_df[FEATURE_COLS]
    y_test = test_df["is_fraud"]

    print("Training rows:", len(X_train))
    print("Testing rows :", len(X_test))

    fraud_count = y_train.sum()
    non_fraud_count = len(y_train) - fraud_count

    scale_pos_weight = non_fraud_count / max(fraud_count, 1)

    model = lgb.LGBMClassifier(
        n_estimators=700,
        learning_rate=0.03,
        max_depth=8,
        num_leaves=64,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        verbosity=-1
    )

    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob > BEST_THRESHOLD).astype(int)

    print("\nROC-AUC:", roc_auc_score(y_test, y_prob))
    print("\nEvaluation at threshold =", BEST_THRESHOLD)
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)

    print("\nModel saved at:", MODEL_PATH)


if __name__ == "__main__":
    train()