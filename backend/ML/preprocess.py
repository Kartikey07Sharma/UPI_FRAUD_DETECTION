from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer

def build_preprocessor(numerical_features):
    numeric_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])

    return ColumnTransformer([
        ("num", numeric_pipeline, numerical_features)
    ])
