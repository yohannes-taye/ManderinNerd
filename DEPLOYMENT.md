# Deployment Guide

## Issue Fixed
The main issue was that the frontend was hardcoded to make API requests to `http://localhost:5000`, which doesn't work when deployed on a server.

## Changes Made

### Frontend (`frontend/src/pages/LessonPage.js`)
- Updated API URL logic to work in both development and production
- Added proper error handling for failed API requests
- In production, uses environment variable `REACT_APP_API_URL` or falls back to relative URLs

### Backend (`backend/server.js`)
- Updated server to listen on `0.0.0.0` instead of just localhost
- This allows the server to accept connections from external sources

## Deployment Configuration

### For Production Deployment

1. **Set Environment Variables:**
   ```bash
   # For the frontend
   export REACT_APP_API_URL=http://68.183.250.107:5000
   
   # For the backend
   export PORT=5000
   export HOST=0.0.0.0
   ```

2. **Build and Deploy:**
   ```bash
   # Build the frontend
   cd frontend
   npm run build
   
   # Start the backend
   cd ../backend
   npm start
   ```

3. **Alternative: Use Relative URLs**
   If you're serving the frontend and backend from the same domain, you can:
   - Set `REACT_APP_API_URL=""` (empty string)
   - The app will use relative URLs like `/blogs/2`
   - Configure your web server to proxy API requests to the backend

### For Development
The app will automatically use `http://localhost:5000` for API requests when running locally.

## Testing the Fix
After deploying with the environment variable set, the frontend should successfully connect to your backend server at `http://68.183.250.107:5000`.
