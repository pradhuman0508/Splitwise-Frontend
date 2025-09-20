# Splitwise Backend API

This backend API provides endpoints to get Firebase UIDs by email addresses using Firebase Admin SDK.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Rename it to `service-account-key.json`
7. Place it in the `backend` folder

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```

### Get UID by Email
```
GET /api/users/uid-by-email?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "uid": "JVSdnKLZPyVisgcEI7seSKlsBv02",
  "email": "user@example.com",
  "displayName": "User Name",
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Multiple UIDs
```
POST /api/users/uid-by-emails
Content-Type: application/json

{
  "emails": ["user1@example.com", "user2@example.com"]
}
```

### List All Users (Debug)
```
GET /api/users/all?maxResults=100
```

## Testing

Test the API endpoints:
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

## Environment Variables

For production, set the Firebase service account key as an environment variable:

```bash
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'
```

## Security Notes

- This API should be deployed behind authentication in production
- Consider rate limiting for the endpoints
- The `/api/users/all` endpoint should be restricted in production
