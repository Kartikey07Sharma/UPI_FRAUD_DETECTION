from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
from config import MODEL_PATH, PREPROCESSOR_PATH

app = FastAPI()

# Load model and preprocessor once on startup
try:
    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    print("✅ ML Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")

class UserProfileData(BaseModel):
    upi_id: str
    total_transactions: int = 0
    failed_transactions: int = 0
    avg_amount: float = 0.0
    total_amount: float = 0.0
    failure_rate: float = 0.0
    night_tx_ratio: float = 0.0
    refund_ratio: float = 0.0
    risky_location_ratio: float = 0.0

@app.post("/predict")
async def predict(data: UserProfileData):
    try:
        # Prepare input for preprocessor
        # The preprocessor expects specific column names based on training
        # Adjust these names if your training script uses different ones
        input_data = pd.DataFrame([{
            "account_age_days": 365, # Placeholder or from DB
            "txn_count_day": data.total_transactions,
            "avg_txn_amount": data.avg_amount,
            "failed_txn_ratio": data.failure_rate,
            "refund_ratio": data.refund_ratio,
            "device_switch_ratio": 0.1, # Placeholder
            "geo_switch_ratio": data.risky_location_ratio
        }])

        X = preprocessor.transform(input_data)
        probability = model.predict_proba(X)[0][1]
        
        label = "NORMAL"
        if probability > 0.75:
            label = "HIGH_RISK"
        elif probability > 0.4:
            label = "SUSPICIOUS"

        return {
            "fraud_probability": float(probability),
            "label": label
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
