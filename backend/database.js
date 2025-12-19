const Database = require("better-sqlite3");
const path = require("path");

// Initialize database
const db = new Database(path.join(__dirname, "chat.db"));

// Create messages table
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Function to save a message
function saveMessage(role, content) {
  const stmt = db.prepare("INSERT INTO messages (role, content) VALUES (?, ?)");
  return stmt.run(role, content);
}

// Function to get all messages
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
  saveMessage,
  getAllMessages,
  clearMessages,
};
