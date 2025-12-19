# Backend Server

Express server for the ChatGPT Web App.

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

## API Endpoints

- `POST /api/chat` - Send a message and get a ChatGPT response
- `GET /api/messages` - Get all conversation messages
- `GET /api/health` - Health check

## Dependencies

- express - Web framework
- cors - CORS middleware
- openai - OpenAI API client
- better-sqlite3 - SQLite database
- dotenv - Environment variables
