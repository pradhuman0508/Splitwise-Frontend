# 🚀 Splitwise Backend API Setup Guide

This guide will help you set up the backend API to get real Firebase UIDs for all registered users.

## 📋 Prerequisites

- Node.js installed on your system
- Firebase project with users registered
- Firebase service account key

## 🛠️ Setup Steps

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Splitwise project
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Rename it to `service-account-key.json`
8. Place it in the `backend` folder

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

### Step 4: Test the Backend API

```bash
# Test the API endpoints
node test-api.js
```

### Step 5: Update Frontend (Already Done)

The frontend has been updated to use the backend API at `http://localhost:3001/api`

## 🧪 Testing

### Test Backend API Directly

```bash
# Health check
curl http://localhost:3001/api/health

# Get UID by email
curl "http://localhost:3001/api/users/uid-by-email?email=yash0098209295@gmail.com"

# Get multiple UIDs
curl -X POST http://localhost:3001/api/users/uid-by-emails \
  -H "Content-Type: application/json" \
  -d '{"emails": ["yash0098209295@gmail.com", "bakadiyayash@gmail.com"]}'
```

### Test from Frontend

1. Start your Angular app: `ng serve`
2. Go to any group page
3. Click the **"Test UID Resolution"** button
4. Check the browser console for results

## 📊 Expected Results

### Before Backend API:
```
🔍 Checking bakadiyayash@gmail.com...
⚠️  Backend API not available, trying alternative method
❌ User bakadiyayash@gmail.com is not registered in Firebase
❌ Failed to resolve UID for bakadiyayash@gmail.com
```

### After Backend API:
```
🔌 Testing backend API connection...
✅ Backend API is running: {status: "OK", message: "Splitwise Backend API is running"}

🔍 Checking bakadiyayash@gmail.com...
✅ Found UID for bakadiyayash@gmail.com via backend API: [REAL_UID]
✅ Successfully resolved REAL Firebase UID for bakadiyayash@gmail.com: [REAL_UID]
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/users/uid-by-email` | GET | Get UID by email |
| `/api/users/uid-by-emails` | POST | Get multiple UIDs |
| `/api/users/all` | GET | List all users (debug) |

## 🚨 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `service-account-key.json` is in the backend folder
- Check Firebase project ID matches

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in backend
- Verify API URL in frontend

### Users not found
- Verify users are registered in Firebase
- Check email addresses are correct
- Ensure Firebase project is correct

## 🎯 Next Steps

1. **Deploy Backend**: Deploy to a cloud service (Heroku, AWS, etc.)
2. **Add Authentication**: Secure the API endpoints
3. **Add Rate Limiting**: Prevent abuse
4. **Add Logging**: Monitor API usage
5. **Add Caching**: Improve performance

## 📝 Notes

- The backend API uses Firebase Admin SDK to get UIDs
- Only registered users will have UIDs returned
- The API is currently unsecured (add authentication for production)
- All endpoints return JSON responses with success/error status
