from ml_pipeline.predict import predict
from datetime import datetime

result = predict(
    receiver_upi="rahul@ybl",
    amount=15000,
    current_time=datetime.now(),
    current_location="Mumbai"
)

print(result)