const Database = require("better-sqlite3");
const path = require("path");

// Initialize database
const db = new Database(path.join(__dirname, "chat.db"));

// Create sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create messages table with session_id
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  )
`);

// Function to create a new session
function createSession(title = "New Chat") {
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const stmt = db.prepare("INSERT INTO sessions (id, title) VALUES (?, ?)");
  stmt.run(id, title);
  return { id, title, created_at: new Date().toISOString() };
}

// Function to get all sessions
function getAllSessions() {
  const stmt = db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC");
  return stmt.all();
}

// Function to get a session by id
function getSession(sessionId) {
  const stmt = db.prepare("SELECT * FROM sessions WHERE id = ?");
  return stmt.get(sessionId);
}

// Function to update session timestamp
function updateSessionTimestamp(sessionId) {
  const stmt = db.prepare(
    "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  );
  return stmt.run(sessionId);
}

// Function to delete a session
function deleteSession(sessionId) {
  const stmt = db.prepare("DELETE FROM sessions WHERE id = ?");
  return stmt.run(sessionId);
}

// Function to save a message
function saveMessage(sessionId, role, content) {
  const stmt = db.prepare(
    "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)"
  );
  const result = stmt.run(sessionId, role, content);
  updateSessionTimestamp(sessionId);
  return result;
}

// Function to get all messages for a session
function getSessionMessages(sessionId) {
  const stmt = db.prepare(
    "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC"
  );
  return stmt.all(sessionId);
}

// Function to get all messages (backwards compatibility)
function getAllMessages() {
  const stmt = db.prepare("SELECT * FROM messages ORDER BY timestamp ASC");
  return stmt.all();
}

// Function to clear all messages (useful for testing)
function clearMessages() {
  const stmt = db.prepare("DELETE FROM messages");
  return stmt.run();
}

module.exports = {
  db,
  createSession,
  getAllSessions,
  getSession,
  updateSessionTimestamp,
  deleteSession,
  saveMessage,
  getSessionMessages,
  getAllMessages,
  clearMessages,
};
