# Frontend

React frontend for the ChatGPT Web App with session management and streaming support.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Scripts

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- ✅ Modern React 19 with hooks
- ✅ Real-time streaming chat interface (SSE)
- ✅ Multiple session management with sidebar
- ✅ Create, switch, and delete sessions
- ✅ Session-based message persistence
- ✅ Real-time typing effect for AI responses
- ✅ Loading states and error handling
- ✅ Responsive design with animations
- ✅ Auto-scroll to latest message
- ✅ Dark theme sidebar

## UI Components

- Session sidebar with chat list
- "+ New Chat" button
- Session switcher
- Delete session button (🗑️)
- Message list with user/assistant distinction
- Input field with send button
- Loading indicator
- Error display

## Dependencies

- react@19.2.3 - UI library
- react-dom@19.2.3 - React DOM renderer
- vite@7.3.0 - Build tool (dev)
- @vitejs/plugin-react@5.1.2 - Vite React plugin (dev)
