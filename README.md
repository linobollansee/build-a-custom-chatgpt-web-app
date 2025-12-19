# Custom ChatGPT Web App

A full-stack chat application with a React frontend and Express backend that integrates with the OpenAI ChatGPT API. Conversations are stored in a SQLite database for persistence.

## Project Structure

```
build-a-custom-chatgpt-web-app/
├── backend/              # Express server
│   ├── server.js         # Main server file with API endpoints
│   ├── database.js       # SQLite database setup and queries
│   ├── package.json      # Backend dependencies
│   ├── .env              # Environment variables (API key)
│   └── chat.db           # SQLite database (auto-generated)
├── frontend/             # React application
│   ├── src/
│   │   ├── App.jsx       # Main chat component
│   │   ├── App.css       # Styles
│   │   └── main.jsx      # React entry point
│   ├── index.html        # HTML template
│   ├── vite.config.js    # Vite configuration
│   └── package.json      # Frontend dependencies
└── docs/
    └── required/
        └── challenge.md  # Original challenge description
```

## Features

✅ **Full-stack chat application**

- React frontend with modern UI and session sidebar
- Express backend with REST API
- OpenAI ChatGPT integration with streaming responses
- SQLite database for message and session persistence

✅ **Core functionality**

- Send messages to ChatGPT with word-by-word streaming
- Multiple chat sessions support
- Create, switch, and delete sessions
- Conversation history loaded on page refresh
- Real-time message updates with typing effect
- Loading states and error handling

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (comes with Node.js)
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation Instructions

### Step 1: Install Backend Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd backend
npm install
```

This installs:

- `express` - Web server framework
- `cors` - Cross-Origin Resource Sharing
- `openai` - OpenAI API client
- `better-sqlite3` - SQLite database
- `dotenv` - Environment variable management
- `nodemon` - Auto-restart server during development (dev dependency)

### Step 2: Configure Backend Environment

Edit the `.env` file in the `backend` directory and add your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=3000
```

**Important:** Replace `your_actual_openai_api_key_here` with your real OpenAI API key.

### Step 3: Install Frontend Dependencies

Navigate to the frontend directory and install the required packages:

```bash
cd ../frontend
npm install
```

This installs:

- `react` - React library
- `react-dom` - React DOM rendering
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - Vite React plugin

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Terminal 1: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

You should see:

```
Server is running on http://localhost:3000
API endpoints available:
  POST   http://localhost:3000/api/chat
  GET    http://localhost:3000/api/messages
  POST   http://localhost:3000/api/sessions
  GET    http://localhost:3000/api/sessions
  DELETE http://localhost:3000/api/sessions/:sessionId
```

### Terminal 2: Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open the Application

Open your browser and navigate to: `http://localhost:5173`

## API Endpoints

### POST /api/chat

Send a message to ChatGPT and receive a streaming response (Server-Sent Events).

**Request:**

```json
{
  "message": "Hello, how are you?",
  "sessionId": "session_1234567890_abc123"
}
```

**Response (Streaming):**

```
data: {"content":"I"}

data: {"content":"'m"}

data: {"content":" doing"}

data: {"content":" well"}

data: {"done":true,"timestamp":"2024-12-19T12:00:00.000Z"}
```

### GET /api/messages

Retrieve conversation history for a specific session or all messages.

**Query Parameters:**

- `sessionId` (optional): Filter messages by session ID

**Response:**

```json
{
  "messages": [
    {
      "id": 1,
      "session_id": "session_1234567890_abc123",
      "role": "user",
      "content": "Hello, how are you?",
      "timestamp": "2024-12-19T12:00:00.000Z"
    },
    {
      "id": 2,
      "session_id": "session_1234567890_abc123",
      "role": "assistant",
      "content": "I'm doing well, thank you for asking!",
      "timestamp": "2024-12-19T12:00:05.000Z"
    }
  ],
  "count": 2
}
```

### POST /api/sessions

Create a new chat session.

**Request:**

```json
{
  "title": "New Chat"
}
```

**Response:**

```json
{
  "id": "session_1234567890_abc123",
  "title": "New Chat",
  "created_at": "2024-12-19T12:00:00.000Z"
}
```

### GET /api/sessions

Get all chat sessions.

**Response:**

```json
{
  "sessions": [
    {
      "id": "session_1234567890_abc123",
      "title": "New Chat",
      "created_at": "2024-12-19T12:00:00.000Z",
      "updated_at": "2024-12-19T12:05:00.000Z"
    }
  ],
  "count": 1
}
```

### DELETE /api/sessions/:sessionId

Delete a chat session and all its messages.

**Response:**

```json
{
  "success": true
}
```

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-12-19T12:00:00.000Z"
}
```

## How It Works

1. **User sends a message**: The React frontend captures the user's input and sends it to the backend via POST `/api/chat` with streaming enabled

2. **Backend processes the request**:

   - Verifies the session exists
   - Saves the user message to the SQLite database
   - Retrieves the conversation history for the session
   - Sends all messages to the OpenAI ChatGPT API with streaming enabled
   - Streams the AI response word-by-word using Server-Sent Events (SSE)
   - Saves the complete assistant's response to the database
   - Updates the session timestamp

3. **Frontend displays the response**: The React app displays the streaming response in real-time with a typing effect

4. **Session management**: Users can create multiple chat sessions, switch between them, and delete old ones

5. **Conversation persistence**: On page reload, the frontend fetches all sessions and loads the messages for the active session

## Database Schema

The SQLite database has two tables:

### Sessions Table

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

role TEXT NOT NULL, -- 'user' or 'assistant'
content TEXT NOT NULL, -- Message content
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

## Key Features Implemented

### 1. Streaming Responses ✅

Messages from ChatGPT appear word-by-word in real-time using Server-Sent Events (SSE). This creates a natural typing effect that enhances the user experience.

### 2. Multiple Chat Sessions ✅

Users can create and manage multiple independent chat sessions:
- Click "+ New Chat" to start a new conversation
- Click on any session in the sidebar to switch to it
- Delete sessions using the 🗑️ button
- Sessions are automatically updated with the latest message timestamp

## Troubleshooting

### Backend won't start

- Make sure port 3000 is not already in use
- Check that your `.env` file has a valid OpenAI API key
- Run `npm install` in the backend directory

### Frontend won't start

- Make sure port 5173 is not already in use
- Run `npm install` in the frontend directory
- Clear your browser cache

### API calls fail

- Ensure the backend server is running on port 3000
- Check the browser console for errors
- Verify your OpenAI API key is valid and has credits

### Database errors

- The database file `chat.db` is created automatically
- To reset the database, delete `chat.db` and restart the backend
- Use the provided clear-db scripts: `.\clear-db.ps1` (Windows) or `./clear-db.sh` (Mac/Linux)

## Additional Enhancement Ideas

Want to further enhance the app? Try these:

1. **Message editing**: Allow users to edit previous messages and regenerate responses

2. **Export conversations**: Add a button to export the conversation as JSON or text file

3. **Session titles**: Auto-generate meaningful session titles from the first message

4. **Search**: Search across all sessions

5. **Tags**: Add tags to sessions for categorization

## Technology Stack

**Frontend:**

- React 19.x
- Vite 7.x
- Modern CSS with animations

**Backend:**

- Node.js
- Express 5.x
- OpenAI API
- SQLite (better-sqlite3)

## License

ISC

## Author

Built as part of a full-stack development challenge.
```
