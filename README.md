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

- React frontend with modern UI
- Express backend with REST API
- OpenAI ChatGPT integration
- SQLite database for message persistence

✅ **Core functionality**

- Send messages to ChatGPT
- Receive and display AI responses
- Conversation history loaded on page refresh
- Real-time message updates
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
  POST http://localhost:3000/api/chat
  GET  http://localhost:3000/api/messages
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

Send a message to ChatGPT and receive a response.

**Request:**

```json
{
  "message": "Hello, how are you?"
}
```

**Response:**

```json
{
  "message": "I'm doing well, thank you for asking!",
  "timestamp": "2024-12-19T12:00:00.000Z"
}
```

### GET /api/messages

Retrieve the entire conversation history.

**Response:**

```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Hello, how are you?",
      "timestamp": "2024-12-19T12:00:00.000Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "I'm doing well, thank you for asking!",
      "timestamp": "2024-12-19T12:00:05.000Z"
    }
  ],
  "count": 2
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

1. **User sends a message**: The React frontend captures the user's input and sends it to the backend via POST `/api/chat`

2. **Backend processes the request**:

   - Saves the user message to the SQLite database
   - Retrieves the full conversation history
   - Sends all messages to the OpenAI ChatGPT API
   - Receives the AI response
   - Saves the assistant's response to the database
   - Returns the response to the frontend

3. **Frontend displays the response**: The React app updates the UI with both the user message and the AI response

4. **Conversation persistence**: On page reload, the frontend fetches all messages from the database via GET `/api/messages` and displays them

## Database Schema

The SQLite database has a single `messages` table:

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,           -- 'user' or 'assistant'
  content TEXT NOT NULL,         -- Message content
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

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

## Extension Challenges

Want to enhance the app? Try these challenges:

1. **Streaming responses**: Implement Server-Sent Events (SSE) to stream ChatGPT responses word-by-word for a typing effect

2. **Multiple chat sessions**: Add a `session_id` column to support multiple independent conversations

3. **Message editing**: Allow users to edit previous messages and regenerate responses

4. **Export conversations**: Add a button to export the conversation as JSON or text file

5. **Dark mode**: Add a theme toggle for dark/light mode

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
