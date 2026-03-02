import pandas as pd
import joblib
import os
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score
from ml_pipeline.db import get_connection

# ================= MODEL NAME =================
MODEL_NAME = "AdaBoost (Tuned)"

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "fraud_model_adaboost.joblib")

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

# ================= HYPERPARAMETER SPACE =================
PARAM_GRID = {
    "n_estimators": [50, 100, 200],
    "learning_rate": [0.5, 1.0, 1.5]
}

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

    print(f"Training Model: {MODEL_NAME}")
    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples : {len(X_test)}")

    # ---------------- BASE ESTIMATOR ----------------
    base_estimator = DecisionTreeClassifier(
        max_depth=1,
        class_weight="balanced",
        random_state=42
    )

    # ---------------- GRID SEARCH ----------------
    adaboost = AdaBoostClassifier(
        estimator=base_estimator,
        random_state=42
    )

    grid = GridSearchCV(
        estimator=adaboost,
        param_grid=PARAM_GRID,
        scoring="roc_auc",
        cv=3,
        n_jobs=-1,
        verbose=1
    )

    grid.fit(X_train, y_train)

    best_model = grid.best_estimator_

    print("\nBest Parameters Found:")
    print(grid.best_params_)

    # ---------------- EVALUATION ----------------
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]

    print(f"\n{MODEL_NAME} Classification Report:\n")
    print(classification_report(y_test, y_pred))
    print(f"{MODEL_NAME} ROC-AUC:", round(roc_auc_score(y_test, y_prob), 4))

    # ---------------- SAVE MODEL ----------------
    joblib.dump(best_model, MODEL_PATH)
    print(f"\n{MODEL_NAME} model trained and saved at:")
    print(MODEL_PATH)

# ================= ENTRY =================
if __name__ == "__main__":
    train()