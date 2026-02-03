import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE

from config import *
from data_loader import load_user_profiles
from features import prepare_labels, split_features
from preprocess import build_preprocessor
from models import get_models
from evaluate import evaluate

def main():
    df = load_user_profiles()
    df = prepare_labels(df)

    X, y = split_features(df)
    num_features = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=RANDOM_STATE
    )

    preprocessor = build_preprocessor(num_features)
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_res, y_train_res = smote.fit_resample(X_train_p, y_train)

    models = get_models()
    scores = {}

    for name, model in models.items():
        model.fit(X_train_res, y_train_res)
        scores[name] = evaluate(model, X_test_p, y_test)

    best_name = max(scores, key=lambda k: scores[k]["roc_auc"])
    best_model = models[best_name]

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(
        {
            "features": num_features,
            "model_version": MODEL_VERSION,
            "trained_at": datetime.now().isoformat()
        },
        FEATURE_SCHEMA_PATH
    )

    print(f"Best model: {best_name}")

if __name__ == "__main__":
    main()
