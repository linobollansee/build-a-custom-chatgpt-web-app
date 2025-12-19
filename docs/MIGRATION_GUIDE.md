# Migration Guide: Upgrading to Sessions & Streaming

If you have an existing installation of this app, follow these steps to upgrade to the new version with streaming responses and multiple sessions support.

## ⚠️ Important: Database Schema Changed

The new version uses a different database schema. Your existing messages will need to be migrated or the database reset.

## Option 1: Fresh Start (Recommended for Development)

This is the simplest approach - start with a clean database:

### Windows (PowerShell)

```powershell
cd backend
.\clear-db.ps1
```

### Mac/Linux

```bash
cd backend
./clear-db.sh
```

This will:

1. Delete the old `chat.db` file
2. Restart the server
3. Automatically create the new schema with sessions support

## Option 2: Manual Migration (Preserve Old Messages)

If you want to keep your existing messages, follow these steps:

### Step 1: Backup existing database

```bash
cd backend
cp chat.db chat.db.backup
```

### Step 2: Manual migration

The old schema didn't have sessions. You'll need to:

1. Create a default session for old messages
2. Add session_id to existing messages

**Migration SQL:**

```sql
-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create a default session for old messages
INSERT INTO sessions (id, title) VALUES ('default_session', 'Legacy Conversation');

-- Create new messages table with session_id
CREATE TABLE messages_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Copy old messages to new table with default session
INSERT INTO messages_new (session_id, role, content, timestamp)
SELECT 'default_session', role, content, timestamp FROM messages;

-- Drop old table and rename new one
DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;
```

### Step 3: Run migration

You can run this SQL using a SQLite browser or command line:

```bash
cd backend
sqlite3 chat.db < migration.sql
```

### Step 4: Restart the application

```bash
npm run dev
```

## Option 3: Start Fresh (Production)

For production deployments:

1. **Export old conversations** (if needed):

   ```bash
   sqlite3 chat.db "SELECT * FROM messages" > old_messages.csv
   ```

2. **Stop the server**

3. **Delete old database**:

   ```bash
   rm chat.db
   ```

4. **Restart the server** - new schema will be created automatically

## What's New?

After upgrading, you'll have access to:

### ✅ Streaming Responses

- Messages appear word-by-word as they're generated
- Natural typing effect
- Faster perceived response time

### ✅ Multiple Sessions

- Create unlimited chat sessions
- Switch between conversations
- Delete old sessions
- Each session maintains independent context

## Verifying the Upgrade

After upgrading, verify everything works:

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Open browser**: http://localhost:5173
4. **Check console** for any errors
5. **Test features**:
   - Create a new session (+ New Chat button)
   - Send a message and watch it stream
   - Create another session
   - Switch between sessions
   - Delete a session

## Troubleshooting

### Error: "Session ID is required"

- **Cause**: Frontend is sending old-style requests without sessionId
- **Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Error: "Table sessions already exists"

- **Cause**: Partial migration completed
- **Solution**: Delete `chat.db` and restart for clean slate

### Messages not appearing

- **Cause**: Session mismatch
- **Solution**: Create a new session and try again

### Streaming not working

- **Cause**: Browser doesn't support ReadableStream
- **Solution**: Update to a modern browser (Chrome 52+, Firefox 65+, Edge 79+)

## Rollback Instructions

If you need to rollback to the old version:

1. **Restore backup**:

   ```bash
   cd backend
   cp chat.db.backup chat.db
   ```

2. **Checkout old code**:

   ```bash
   git checkout <old-commit-hash>
   ```

3. **Restart servers**

## Need Help?

- Check [`README.md`](../README.md) for updated documentation
- See [`EXTENSION_IMPLEMENTATION.md`](EXTENSION_IMPLEMENTATION.md) for technical details
- Review console logs for specific errors

---

**Note**: This migration is one-way. Once you upgrade, the new database schema requires the new code. Keep backups if you might need to rollback!
