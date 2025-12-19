# Backend Server

Express server for the ChatGPT Web App with session management and streaming support.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

3. Start the development server:

```bash
npm run dev
```

Or start in production mode:

```bash
npm start
```

## Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server with nodemon (auto-restart on file changes)
- `npm run clear-db` - Clear the SQLite database

## API Endpoints

- `POST /api/chat` - Send a message and get a streaming ChatGPT response (SSE)
- `GET /api/messages?sessionId=<id>` - Get conversation messages for a session
- `POST /api/sessions` - Create a new chat session
- `GET /api/sessions` - Get all chat sessions
- `DELETE /api/sessions/:sessionId` - Delete a chat session
- `GET /api/health` - Health check

## Features

- ✅ Server-Sent Events (SSE) for streaming responses
- ✅ Multiple chat sessions support
- ✅ Session-based conversation management
- ✅ SQLite database with sessions and messages tables
- ✅ Automatic session timestamp updates
- ✅ CASCADE DELETE for data integrity

## Dependencies

- express@5.2.1 - Web framework
- cors@2.8.5 - CORS middleware
- openai@6.15.0 - OpenAI API client with streaming support
- better-sqlite3@12.5.0 - SQLite database
- dotenv@17.2.3 - Environment variables
- nodemon@3.1.11 - Development auto-reload (dev dependency)
