import pandas as pd
import numpy as np
import joblib
from sqlalchemy import create_engine
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score, recall_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from imblearn.over_sampling import SMOTE

from config import *


# ---------------------------------------------------
# 2. LOAD DATA
# ---------------------------------------------------

def load_transactions():
    engine = create_engine(DATABASE_URI)
    df = pd.read_sql("SELECT * FROM transactions", engine)
    return df

# ---------------------------------------------------
# 3. FEATURE ENGINEERING (USER PROFILE)
# ---------------------------------------------------

def build_user_profiles(df):
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    today = pd.to_datetime("today")

    profile = df.groupby("upi_id").agg(
        account_age_days=("timestamp", lambda x: (today - x.min()).days),
        txn_count=("timestamp", "count"),
        active_days=("timestamp", lambda x: (x.max() - x.min()).days + 1),
        avg_txn_amount=("amount", "mean"),
        failed_txn_ratio=("tx_status", lambda x: (x != "success").mean()),
        refund_ratio=("is_refund", "mean"),
        avg_risk_probability=("risk_probability", "mean"),
        label=("is_fraud", "max"),
        device_id=("device_id", lambda x: x.mode()[0]),
        geo_location=("geo_location", lambda x: x.mode()[0]),
    ).reset_index()

    profile["txn_count_day"] = profile["txn_count"] / profile["active_days"]

    X = profile.drop(columns=["upi_id", "label", "txn_count", "active_days"])
    y = profile["label"]

    return X, y

# ---------------------------------------------------
# 4. PREPROCESSING PIPELINE
# ---------------------------------------------------

def build_preprocessor():
    numerical_features = [
        "account_age_days",
        "txn_count_day",
        "avg_txn_amount",
        "failed_txn_ratio",
        "refund_ratio",
        "avg_risk_probability"
    ]

    categorical_features = ["device_id", "geo_location"]

    numeric_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline([
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer([
        ("num", numeric_pipeline, numerical_features),
        ("cat", categorical_pipeline, categorical_features)
    ])

    return preprocessor, numerical_features, categorical_features

# ---------------------------------------------------
# 5. MODEL TRAINING
# ---------------------------------------------------

def train_models(X_train, y_train):
    models = {
        "logistic": LogisticRegression(max_iter=1000),
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight="balanced",
            random_state=RANDOM_STATE
        )
    }

    trained = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        trained[name] = model

    return trained

# ---------------------------------------------------
# 6. EVALUATION
# ---------------------------------------------------

def evaluate(model, X_test, y_test):
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob > 0.5).astype(int)

    return {
        "roc_auc": roc_auc_score(y_test, y_prob),
        "recall": recall_score(y_test, y_pred),
        "report": classification_report(y_test, y_pred)
    }

# ---------------------------------------------------
# 7. MAIN PIPELINE
# ---------------------------------------------------

def main():
    print("Loading transactions...")
    df = load_transactions()

    print("Building user profiles...")
    X, y = build_user_profiles(df)

    print("Train-test split...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=RANDOM_STATE
    )

    print("Preprocessing...")
    preprocessor, num_feats, cat_feats = build_preprocessor()

    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    print("Handling class imbalance (SMOTE)...")
    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_res, y_train_res = smote.fit_resample(X_train_p, y_train)

    print("Training models...")
    models = train_models(X_train_res, y_train_res)

    print("\nEvaluation results:")
    scores = {}
    for name, model in models.items():
        metrics = evaluate(model, X_test_p, y_test)
        scores[name] = metrics
        print(f"\n{name.upper()}")
        print("ROC-AUC:", metrics["roc_auc"])
        print("Recall:", metrics["recall"])

    best_model_name = max(scores, key=lambda k: scores[k]["roc_auc"])
    best_model = models[best_model_name]

    print(f"\nBest model selected: {best_model_name}")

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(
        {
            "numerical": num_feats,
            "categorical": cat_feats,
            "model_version": MODEL_VERSION,
            "trained_at": datetime.now().isoformat()
        },
        FEATURE_SCHEMA_PATH
    )

    print("Artifacts saved successfully.")

if __name__ == "__main__":
    main()
