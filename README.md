# 🚀 UPI Fraud Detection System

A complete **end-to-end fraud detection system** using:

* 🗄️ MySQL (Database)
* 🧠 Python (ML Model)
* ⚙️ Node.js (Backend API)
* 🎨 React + Vite (Frontend)

---

# 📌 1. PROJECT ARCHITECTURE

```
Frontend (React UI)
        ↓
Backend (Node.js API)
        ↓
ML Model API (Python - FastAPI/Flask)
        ↓
MySQL Database
```

---

# 📂 2. FOLDER STRUCTURE

```
UPI_FRAUD_DETECTION/
│
├── Database/
│   ├── generate_dataset.py
│   ├── update_user_profile.py
│   ├── label_user_profile.py
│
├── ml_pipeline/
│   ├── train_model_main.py
│   ├── fraud_model_lgbm.joblib
│   ├── app.py (ML API)
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── config/db.js
│   ├── app.js
│   ├── server.js
│
├── FRONTEND/
│   ├── src/
│   ├── package.json
│
└── README.md
```

---

# 🧠 3. DATABASE (MySQL)

## 🔹 Tables

### 1. `transactions`

Stores raw transaction data

| Column       | Purpose            |
| ------------ | ------------------ |
| upi_id       | User identifier    |
| amount       | Transaction amount |
| tx_status    | success/failed     |
| device_id    | Device used        |
| geo_location | Location           |
| is_fraud_txn | Fraud label        |

---

### 2. `user_profiles`

Stores ML features

| Feature             | Meaning              |
| ------------------- | -------------------- |
| txn_count_day       | Transactions per day |
| avg_txn_amount      | Average amount       |
| failed_txn_ratio    | Failure %            |
| refund_ratio        | Refund %             |
| device_switch_ratio | Device change        |
| geo_switch_ratio    | Location change      |
| avg_txn_time_gap    | Time gap             |

---

### 3. `users`

Application login users

---

### 4. `fraud_alerts`

Stores fraud predictions

---

# ⚙️ 4. DATABASE SCRIPTS

## 🔹 `generate_dataset.py`

👉 Creates fake transaction data

## 🔹 `update_user_profile.py`

👉 Converts transactions → ML features

## 🔹 `label_user_profile.py`

👉 Adds fraud labels using rules

---

# 🤖 5. ML MODEL

## 🔹 File: `train_model_main.py`

👉 Trains model using:

* txn_count_day
* avg_txn_amount
* failed_txn_ratio
* refund_ratio
* device_switch_ratio
* geo_switch_ratio
* avg_txn_time_gap

## 🔹 Output:

```
fraud_model_lgbm.joblib
```

---

## 🔹 ML API (`app.py`)

Runs a server:

```
POST /predict
```

### Input:

```json
{
  "txn_count_day": 5,
  "avg_txn_amount": 2000,
  "failed_txn_ratio": 0.1,
  "refund_ratio": 0.05,
  "device_switch_ratio": 0.1,
  "geo_switch_ratio": 0.1,
  "avg_txn_time_gap": 60
}
```

### Output:

```json
{
  "fraud_probability": 0.23
}
```

---

# ⚙️ 6. BACKEND (Node.js)

## 🔹 Key Files

### `server.js`

Starts backend server

---

### `app.js`

Registers routes:

```
/api/auth
/api/transactions
/api/fraud
```

---

### Controllers

#### `auth.controller.js`

👉 Register & login users

#### `transaction.controller.js`

👉 Saves transaction to DB
👉 Triggers feature update

#### `fraud.controller.js`

👉 Calls ML model
👉 Returns fraud result

---

### Services

#### `fraudPrediction.service.js`

👉 Calls Python ML API
👉 Applies risk rules
👉 Logs fraud events

---

#### `userProfile.service.js`

👉 Runs Python script:

```
update_user_profile.py
```

---

### Utils

#### `riskRules.js`

👉 Converts probability → SAFE / WARNING / BLOCK

#### `logger.js`

👉 Saves fraud logs

---

# 🎨 7. FRONTEND

Built using:

* React
* Vite
* ShadCN UI

## Features:

* Send transaction
* Show fraud result
* Charts (analytics)

---

# 🔗 8. HOW EVERYTHING CONNECTS

## 🔄 Flow:

```
User → Frontend
        ↓
POST /api/fraud/check
        ↓
Backend
        ↓
fraudPrediction.service
        ↓
Python ML API (/predict)
        ↓
Return probability
        ↓
Apply rules
        ↓
Send response to frontend
```

---

# 🧪 9. HOW TO RUN PROJECT

## ✅ Step 1: Start MySQL

Make sure DB exists:

```
upi_fraud_db
```

---

## ✅ Step 2: Generate Data

```bash
cd Database
python generate_dataset.py
```

---

## ✅ Step 3: Create Features

```bash
python update_user_profile.py
```

---

## ✅ Step 4: Label Data

```bash
python label_user_profile.py
```

---

## ✅ Step 5: Train Model

```bash
cd ../ml_pipeline
python -m ml_pipeline.train_model_main
```

---

## ✅ Step 6: Start ML API

```bash
uvicorn app:app --reload --port 8000
```

---

## ✅ Step 7: Start Backend

```bash
cd ../backend
npm install
node server.js
```

---

## ✅ Step 8: Start Frontend

```bash
cd ../FRONTEND
npm install
npm run dev
```

---

# 🌐 PORTS

| Service  | Port |
| -------- | ---- |
| Frontend | 5173 |
| Backend  | 5000 |
| ML API   | 8000 |
| MySQL    | 3306 |

---

# ⚠️ COMMON ERRORS

## ❌ Vite not found

```
npm install
```

---

## ❌ ML API not working

```
Check port 8000 running
```

---

## ❌ DB connection failed

Check:

```
host: localhost
user: root
password
```

---

# 🚀 FEATURES

✔ Fraud detection using ML
✔ Real-time API
✔ Feature engineering pipeline
✔ Logging system
✔ Authentication
✔ Dashboard ready

---

# 💯 FINAL RESULT

This project simulates a **real fintech fraud detection system**:

```
Transaction → ML → Risk Detection → Alert 🚨
```

---

# 🎯 FUTURE IMPROVEMENTS

* Real-time streaming (WebSockets)
* Dashboard with charts
* Deployment (AWS / Render)
* Improve recall (fraud detection)

---


# ⭐ NOTE

This is an **industry-level project** suitable for:

* Placements
* Internships
* Portfolio
* Resume

---
**🔥 You built a complete AI-powered system — great work!**

---

# 📊 10. MODEL PERFORMANCE METRICS

The current LightGBM model (`fraud_model_lgbm.joblib`) was evaluated on the test set with the following performance metrics for Fraud Detection (Class 1):

* **Accuracy**: 0.91 (91%)
* **Precision**: 0.47 (47%)
* **Recall**: 0.62 (62%)
* **F1-Score**: 0.54 (54%)

*Note: The model is threshold-optimized to `0.4` to balance false positives with high risk detection.*
 

how to run the project
 step 1  sql connect with the password in generate_dataset.py and update_user_profile.py and label_user_profile.py file
 

 step 2 sql code 
 
 -- =========================================
-- RESET DATABASE
-- =========================================
DROP DATABASE IF EXISTS upi_fraud_db;
CREATE DATABASE upi_fraud_db;
USE upi_fraud_db;


-- =========================================
-- TRANSACTIONS TABLE (RAW DATA)
-- =========================================
CREATE TABLE transactions (
    tx_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    upi_id VARCHAR(50) NOT NULL,
    tx_timestamp DATETIME NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    tx_status ENUM('success','failed','pending') NOT NULL,
    is_refund TINYINT(1) DEFAULT 0,
    device_id VARCHAR(30),
    geo_location VARCHAR(50),
    upi_created_date DATE,
    is_fraud_txn TINYINT(1) DEFAULT 0,

    INDEX idx_upi (upi_id),
    INDEX idx_timestamp (tx_timestamp),
    INDEX idx_device (device_id),
    INDEX idx_geo (geo_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- USER PROFILES (ML DATASET)
-- =========================================
CREATE TABLE user_profiles (
    profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    upi_id VARCHAR(50) NOT NULL,
    window_start DATE NOT NULL,
    window_end DATE NOT NULL,

    -- =============================
    -- CORE BEHAVIOURAL FEATURES
    -- =============================
    account_age_days INT DEFAULT 0,
    days_active INT DEFAULT 0,
    txn_count_day FLOAT DEFAULT 0,
    avg_txn_amount FLOAT DEFAULT 0,
    max_txn_amount FLOAT DEFAULT 0,
    failed_txn_ratio FLOAT DEFAULT 0,
    refund_ratio FLOAT DEFAULT 0,
    device_switch_ratio FLOAT DEFAULT 0,
    geo_switch_ratio FLOAT DEFAULT 0,
    avg_txn_time_gap FLOAT DEFAULT 0,
    night_txn_ratio FLOAT DEFAULT 0,
    burst_txn_count INT DEFAULT 0,

    -- =============================
    -- 🔥 NEW STRONG FEATURES (IMPORTANT)
    -- =============================
    amount_std FLOAT DEFAULT 0,
    high_value_ratio FLOAT DEFAULT 0,
    failed_burst INT DEFAULT 0,
    txn_density FLOAT DEFAULT 0,

    -- =============================
    -- LABELS & OUTPUTS
    -- =============================
    is_fraud TINYINT(1) DEFAULT 0,
    fraud_probability FLOAT DEFAULT NULL,
    fraud_type VARCHAR(30) DEFAULT NULL,

    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_window (upi_id, window_start),
    INDEX idx_upi (upi_id),
    INDEX idx_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- FRAUD ALERTS TABLE
-- =========================================
CREATE TABLE fraud_alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    upi_id VARCHAR(50) NOT NULL,
    fraud_probability FLOAT NOT NULL,
    risk_level ENUM('LOW','MEDIUM','HIGH','UNKNOWN') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_upi (upi_id),
    INDEX idx_risk (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- USERS TABLE (APP USERS)
-- =========================================
CREATE TABLE users (
    app_user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- VERIFICATION QUERIES
-- =========================================

SHOW TABLES;

DESCRIBE transactions;
DESCRIBE user_profiles;
DESCRIBE fraud_alerts;
DESCRIBE users;


-- =========================================
-- DATA ANALYSIS
-- =========================================

-- Transactions distribution
SELECT 
    is_fraud_txn,
    COUNT(*) AS total_transactions
FROM transactions
GROUP BY is_fraud_txn;


-- User profile distribution
SELECT 
    is_fraud,
    COUNT(*) AS total_users
FROM user_profiles
GROUP BY is_fraud;


-- Sample fraud transactions
SELECT * 
FROM transactions 
WHERE is_fraud_txn = 1
LIMIT 50;


-- Sample user profiles
SELECT * 
FROM user_profiles
LIMIT 50;


-- =========================================
-- CLEAN TABLES (RE-RUN PIPELINE)
-- =========================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE fraud_alerts;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE transactions;

SET FOREIGN_KEY_CHECKS = 1;


SHOW DATABASES;

USE upi_fraud_db;

SHOW TABLES;

SELECT COUNT(*) FROM transactions;
 
 
 
 
 step 3 open terminnal navigate to database 
 
 PS E:\TESTING FINAL\Database> python generate_dataset.py
Inserted 5000 / 150000
Inserted 10000 / 150000
Inserted 15000 / 150000
Inserted 20000 / 150000
Inserted 25000 / 150000
Inserted 30000 / 150000
Inserted 35000 / 150000
Inserted 40000 / 150000
Inserted 45000 / 150000
Inserted 50000 / 150000
Inserted 55000 / 150000
Inserted 60000 / 150000
Inserted 65000 / 150000
Inserted 70000 / 150000
Inserted 75000 / 150000
Inserted 80000 / 150000
Inserted 85000 / 150000
Inserted 90000 / 150000
Inserted 95000 / 150000
Inserted 100000 / 150000
Inserted 105000 / 150000
Inserted 110000 / 150000
Inserted 115000 / 150000
Inserted 120000 / 150000
Inserted 125000 / 150000
Inserted 130000 / 150000
Inserted 135000 / 150000
Inserted 140000 / 150000
Inserted 145000 / 150000
Inserted 150000 / 150000

Total Inserted 150000 transactions
 

 then  

 PS E:\TESTING FINAL\Database> python update_user_profile.py
E:\TESTING FINAL\Database\update_user_profile.py:19: UserWarning: pandas only supports SQLAlchemy connectable (engine/connection) or database string URI or sqlite3 DBAPI2 connection. Other DBAPI2 objects are not tested. Please consider using SQLAlchemy.
  df = pd.read_sql(query, conn)
Inserted 139961 user profile rows 

then 


E:\TESTING FINAL\Database\label_user_profiles.py:98: UserWarning: pandas only supports SQLAlchemy connectable (engine/connection) or database string URI or sqlite3 DBAPI2 connection. Other DBAPI2 objects are not tested. Please consider using SQLAlchemy.
  stats = pd.read_sql("""

Label distribution:
   is_fraud   count
0         1    1932
1         0  138029

step 4: Run All Components One by One

You need to open separate terminal windows for each of the following:

### 1. FRONTEND (React)
Open a new terminal and run:
```bash
cd "E:\TESTING FINAL\FRONTEND"
npm install
npm run dev
```

### 2. BACKEND (Node.js)
Open a second terminal and run:
```bash
cd "E:\TESTING FINAL\Backend"
npm install
node server.js
```

### 3. ML API (Python FastAPI)
Open a third terminal and run:
```bash
cd "E:\TESTING FINAL\ml_pipeline"
pip install fastapi uvicorn scikit-learn pandas lightgbm
uvicorn app:app --reload --port 8000
```

### 4. DATABASE (MySQL)
Make sure your MySQL server (e.g., XAMPP, MySQL Workbench, or MySQL Command Line) is running on port 3306. 
(You already created the tables and generated the data in Steps 1, 2, and 3).