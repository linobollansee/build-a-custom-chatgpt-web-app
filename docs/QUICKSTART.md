# Quick Start Guide

## Installation Commands (Step by Step)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# The following packages will be installed:
# - express (web server)
# - cors (enable cross-origin requests)
# - openai (OpenAI API client)
# - better-sqlite3 (SQLite database)
# - dotenv (environment variables)
# - nodemon (dev dependency for auto-reload)
```

### 2. Configure OpenAI API Key

Edit `backend/.env` and add your API key:

```env
OPENAI_API_KEY=your_actual_api_key_here
PORT=3000
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install all dependencies
npm install

# The following packages will be installed:
# - react (React library)
# - react-dom (React DOM rendering)
# - vite (build tool and dev server)
# - @vitejs/plugin-react (Vite React plugin)
```

### 4. Running the Application

**Open TWO terminal windows/tabs:**

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Expected output:

```
Server is running on http://localhost:3000
API endpoints available:
  POST http://localhost:3000/api/chat
  GET  http://localhost:3000/api/messages
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Expected output:

```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 5. Open in Browser

Navigate to: http://localhost:5173

## Testing the Application

1. Type a message in the input field (e.g., "Hello, how are you?")
2. Click "Send" button
3. Wait for ChatGPT's response
4. Refresh the page - your conversation should persist!

## Troubleshooting

**"Failed to send message"**

- Make sure the backend is running on port 3000
- Check that your OpenAI API key is valid
- Verify you have API credits available

**"Cannot find module"**

- Run `npm install` in the relevant directory (backend or frontend)

**Port already in use**

- Backend (3000): Change PORT in `.env`
- Frontend (5173): Change port in `vite.config.js`

## Project Structure Summary

```
├── backend/
│   ├── server.js         # Express server with API routes
│   ├── database.js       # SQLite database functions
│   ├── .env              # Your OpenAI API key (REQUIRED)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── App.css       # Styles
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js    # Vite config with proxy
│   └── package.json
└── README.md             # Full documentation
```

## What's Implemented

✅ Express backend with REST API
✅ ChatGPT API integration
✅ SQLite database for message persistence
✅ React frontend with modern UI
✅ Real-time chat interface
✅ Conversation history on page load
✅ Error handling and loading states
✅ CORS configuration
✅ Auto-scroll to new messages
✅ Responsive design

## Next Steps (Optional Enhancements)

1. **Streaming responses** - Add Server-Sent Events for word-by-word display
2. **Multiple sessions** - Add session_id for separate conversations
3. **Authentication** - Add user login system
4. **Message editing** - Allow editing and regenerating responses
5. **Export functionality** - Download conversation as JSON/text
