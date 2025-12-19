# Step-by-Step Installation Commands

This document contains all the actual installation commands used to build this project.

## Step 1: Backend Setup

```bash
# Create and initialize backend
mkdir backend
cd backend
npm init -y
```

## Step 2: Install Backend Dependencies

```bash
# Install production dependencies
npm install express cors openai better-sqlite3 dotenv

# Install development dependencies
npm install --save-dev nodemon
```

**Packages installed:**

- `express@5.2.1` - Web framework for Node.js
- `cors@2.8.5` - Enable Cross-Origin Resource Sharing
- `openai@6.15.0` - OpenAI API client library
- `better-sqlite3@12.5.0` - Fast SQLite3 bindings
- `dotenv@17.2.3` - Load environment variables from .env file
- `nodemon@3.1.11` - Auto-restart server on file changes (dev)

## Step 3: Configure Environment Variables

```bash
# Create .env file in backend directory
# Add your OpenAI API key:
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Step 4: Frontend Setup

```bash
# Navigate to project root
cd ..

# Create and initialize frontend
mkdir frontend
cd frontend
npm init -y
```

## Step 5: Install Frontend Dependencies

```bash
# Install React and ReactDOM
npm install react react-dom

# Install Vite and React plugin
npm install vite @vitejs/plugin-react --save-dev
```

**Packages installed:**

- `react@19.2.3` - React library
- `react-dom@19.2.3` - React DOM rendering
- `vite@7.3.0` - Next generation frontend build tool
- `@vitejs/plugin-react@5.1.2` - Vite plugin for React

## Step 6: Update package.json Scripts

### Backend (backend/package.json)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Frontend (frontend/package.json)

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 7: Running the Application

### Terminal 1 - Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**

```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
Server is running on http://localhost:3000
API endpoints available:
  POST   http://localhost:3000/api/chat
  GET    http://localhost:3000/api/messages
  POST   http://localhost:3000/api/sessions
  GET    http://localhost:3000/api/sessions
  DELETE http://localhost:3000/api/sessions/:sessionId
```

### Terminal 2 - Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected output:**

```
VITE v7.3.0  ready in 182 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

## Step 8: Open Application

Open your browser and go to: http://localhost:5173

## Verification Commands

```bash
# Check Node.js version
node --version
# Should be v16 or higher

# Check npm version
npm --version
# Should be 7 or higher

# Check if backend dependencies are installed
cd backend
npm list --depth=0

# Check if frontend dependencies are installed
cd ../frontend
npm list --depth=0
```

## Testing the Installation

1. **Backend Health Check:**

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "OK", "timestamp": "2024-12-19T12:00:00.000Z" }
```

2. **Get Sessions:**

```bash
curl http://localhost:3000/api/sessions
```

Expected response (if no sessions yet):

```json
{ "sessions": [], "count": 0 }
```

3. **Create a Test Session:**

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat"}'
```

Expected response:

```json
{
  "id": "session_1234567890_abc123",
  "title": "Test Chat",
  "created_at": "2024-12-19T12:00:00.000Z"
}
```

4. **Send a Test Message (requires sessionId):**

```bash
# Replace SESSION_ID with actual session ID from previous command
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, ChatGPT!", "sessionId":"SESSION_ID"}'
```

This will return a streaming response with Server-Sent Events.

````

## Common Issues and Solutions

### Issue: "Cannot find module 'express'"

**Solution:**

```bash
cd backend
npm install
````

### Issue: "Cannot find module 'react'"

**Solution:**

```bash
cd frontend
npm install
```

### Issue: Port 3000 already in use

**Solution:**
Change PORT in `backend/.env`:

```env
PORT=3001
```

### Issue: Port 5173 already in use

**Solution:**
Change port in `frontend/vite.config.js`:

```javascript
server: {
  port: 5174,
}
```

### Issue: "Invalid API key"

**Solution:**

1. Get a new API key from https://platform.openai.com/api-keys
2. Update `backend/.env` with the correct key
3. Restart the backend server

### Issue: Database errors

**Solution:**
Delete the database and restart:

```bash
cd backend
rm chat.db
npm run dev
```

## Complete Installation Script (Windows PowerShell)

```powershell
# Navigate to project directory
cd "C:\Users\N\Documents\Projects\build-a-custom-chatgpt-web-app"

# Backend
cd backend
npm install
# Edit .env file and add your OpenAI API key

# Frontend
cd ..\frontend
npm install

# Done! Now run both servers in separate terminals
```

## Complete Installation Script (Mac/Linux)

```bash
# Navigate to project directory
cd ~/Projects/build-a-custom-chatgpt-web-app

# Backend
cd backend
npm install
# Edit .env file and add your OpenAI API key

# Frontend
cd ../frontend
npm install

# Done! Now run both servers in separate terminals
```

## Summary

Total dependencies installed:

- Backend: 105 packages (including transitive dependencies)
- Frontend: 66 packages (including transitive dependencies)

Total setup time: ~2-3 minutes (depending on internet speed)

Project is now ready to run! 🚀
