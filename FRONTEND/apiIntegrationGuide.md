# UPI Fraud Detection System - API Integration Guide

This guide explains how to connect the frontend application with a backend API for real fraud detection.

## Backend API Setup

### 1. API Configuration

Create a configuration file for your API endpoints:

```javascript
// src/api/config.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  SUBMIT_TRANSACTION: "/transactions",
  GET_ANALYTICS: "/analytics",
  GET_TRANSACTIONS: "/transactions/history",
  UPDATE_TRANSACTION_STATUS: "/transactions/:id/status",
  GET_USERS: "/users",
  GET_USER_DETAILS: "/users/:id",
};
```

### 2. API Client Setup

Create an API client using Axios:

```javascript
// src/api/client.js
import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. API Service Functions

Create service functions for each feature:

```javascript
// src/api/services/transactionService.js
import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export const submitTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SUBMIT_TRANSACTION, {
      sender_id: transactionData.senderId,
      receiver_id: transactionData.receiverId,
      amount: parseFloat(transactionData.amount),
      location: transactionData.location,
      device_id: transactionData.deviceId,
      transaction_type: transactionData.transactionType,
      timestamp: new Date().toISOString(),
    });
    
    return {
      transactionId: response.data.transaction_id,
      status: response.data.is_fraud ? 'suspicious' : 'safe',
      riskScore: response.data.risk_score,
      reason: response.data.reason,
    };
  } catch (error) {
    console.error('Transaction submission error:', error);
    throw error;
  }
};

export const getTransactionHistory = async (filters = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GET_TRANSACTIONS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
};

export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const endpoint = API_ENDPOINTS.UPDATE_TRANSACTION_STATUS.replace(':id', transactionId);
    const response = await apiClient.patch(endpoint, { status });
    return response.data;
  } catch (error) {
    console.error('Update transaction status error:', error);
    throw error;
  }
};
```

```javascript
// src/api/services/analyticsService.js
import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export const getAnalyticsData = async (timeRange = '30d') => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GET_ANALYTICS, {
      params: { time_range: timeRange },
    });
    
    return {
      totalTransactions: response.data.total_transactions,
      fraudulentTransactions: response.data.fraudulent_transactions,
      detectionRate: response.data.detection_rate,
      trendData: response.data.trend_data,
      featureImportance: response.data.feature_importance,
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    throw error;
  }
};
```

```javascript
// src/api/services/userService.js
import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export const getUsers = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.GET_USERS);
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const endpoint = API_ENDPOINTS.GET_USER_DETAILS.replace(':id', userId);
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Get user details error:', error);
    throw error;
  }
};
```

### 4. Integrating with React Components

Update the Transaction Simulator to use real API:

```javascript
// In src/pages/TransactionSimulator.tsx
import { submitTransaction } from '@/api/services/transactionService';
import { toast } from '@/hooks/use-toast';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const result = await submitTransaction(formData);
    setResult(result);
    toast({
      title: "Transaction Analyzed",
      description: `Risk Score: ${result.riskScore}%`,
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to analyze transaction. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

Update Analytics page:

```javascript
// In src/pages/Analytics.tsx
import { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/api/services/analyticsService';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalyticsData('30d');
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Use analyticsData to populate charts...
}
```

## Expected Backend API Responses

### POST /api/transactions
```json
{
  "transaction_id": "TXN-123456",
  "is_fraud": false,
  "risk_score": 15.5,
  "reason": "Transaction matches normal behavior patterns",
  "timestamp": "2025-11-08T14:30:00Z"
}
```

### GET /api/analytics
```json
{
  "total_transactions": 12543,
  "fraudulent_transactions": 143,
  "legitimate_transactions": 12400,
  "detection_rate": 99.2,
  "trend_data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "fraud_count": [45, 52, 38, 48]
  },
  "feature_importance": [
    { "feature": "Amount", "importance": 40 },
    { "feature": "Device ID", "importance": 25 },
    { "feature": "Location", "importance": 20 },
    { "feature": "Transaction Type", "importance": 10 },
    { "feature": "Time of Day", "importance": 5 }
  ]
}
```

### GET /api/transactions/history
```json
{
  "transactions": [
    {
      "id": "TXN-001",
      "sender_id": "user@upi",
      "receiver_id": "merchant@upi",
      "amount": 5000,
      "status": "safe",
      "risk_score": 12.5,
      "timestamp": "2025-11-08T14:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20
}
```

## Environment Variables

Create a `.env` file in your project root:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

For production:

```
REACT_APP_API_URL=https://api.yourproduction.com/api
REACT_APP_ENV=production
```

## Security Best Practices

1. **HTTPS**: Always use HTTPS in production
2. **Authentication**: Implement JWT or OAuth2 for API authentication
3. **Rate Limiting**: Implement rate limiting on the backend
4. **Input Validation**: Validate all inputs on both frontend and backend
5. **CORS**: Configure CORS properly on your backend
6. **Error Handling**: Never expose sensitive error details to the frontend

## Testing the Integration

1. Start your backend server on `http://localhost:5000`
2. Update the `API_BASE_URL` in your config
3. Run the frontend development server
4. Test each feature:
   - Transaction submission
   - Analytics data loading
   - User management
   - Transaction history

## Next Steps

1. Implement authentication system
2. Add WebSocket support for real-time updates
3. Implement caching with React Query
4. Add comprehensive error handling
5. Set up monitoring and logging
6. Deploy backend and frontend to production

For more information, refer to the backend API documentation.
