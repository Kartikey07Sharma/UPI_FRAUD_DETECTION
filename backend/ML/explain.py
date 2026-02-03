import shap
import joblib
import pandas as pd
from sqlalchemy import create_engine
from config import DATABASE_URI, MODEL_PATH, PREPROCESSOR_PATH

def explain_one(profile_id):
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)

    engine = create_engine(DATABASE_URI)
    df = pd.read_sql(
        f"""
        SELECT
            account_age_days,
            txn_count_day,
            avg_txn_amount,
            failed_txn_ratio,
            refund_ratio,
            device_switch_ratio,
            geo_switch_ratio
        FROM user_profiles
        WHERE profile_id = {profile_id}
        """,
        engine
    )

    X = preprocessor.transform(df)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    shap.summary_plot(
        shap_values,
        df,
        plot_type="bar",
        show=True
    )

if __name__ == "__main__":
    explain_one(profile_id=1)
