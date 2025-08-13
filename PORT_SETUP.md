# PaySSD Port Configuration Guide

## Fixed Port Configuration

The application is now configured to always use consistent ports:
- **Backend Server**: Port 5000
- **Frontend Client**: Port 3000

## Configuration Files

### Backend (.env)
```
PORT=5000
```

### Frontend (client/.env)
```
PORT=3000
REACT_APP_API_URL=http://localhost:5000
```

## Easy Startup

### Option 1: Use the Startup Script (Recommended)
Double-click `start.bat` in the project root directory. This will:
- Start the backend server on port 5000
- Start the frontend client on port 3000
- Open both in separate command windows

### Option 2: Manual Startup
1. Open two command prompt windows
2. In the first window:
   ```
   cd c:\Users\pc\Desktop\PaySSD
   npm run server
   ```
3. In the second window:
   ```
   cd c:\Users\pc\Desktop\PaySSD\client
   npm start
   ```

### Option 3: Single Command
```
cd c:\Users\pc\Desktop\PaySSD
npm run dev
```

## Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

If ports are still changing:
1. Make sure the .env files exist and contain the PORT settings
2. Restart your command prompt/terminal
3. Use the `start.bat` script for guaranteed consistency

## Note
The PORT environment variables in the .env files will override any default port selection, ensuring consistent ports every time you restart your PC.