from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from config import RANDOM_STATE

def get_models():
    return {
        "logistic": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=RANDOM_STATE
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=10,
            min_samples_leaf=10,
            class_weight="balanced",
            random_state=RANDOM_STATE
        )
    }
