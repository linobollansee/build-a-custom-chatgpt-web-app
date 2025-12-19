import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamingMessage]);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);

      // If no current session and sessions exist, select the first one
      if (!currentSessionId && data.sessions.length > 0) {
        setCurrentSessionId(data.sessions[0].id);
      }
      // If no sessions exist, create a new one
      else if (data.sessions.length === 0) {
        await createNewSession();
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    }
  };

  // Create a new session
  const createNewSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const newSession = await response.json();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create new session");
    }
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If deleted session was current, switch to another
      if (sessionId === currentSessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          createNewSession();
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session");
    }
  };

  // Fetch all messages from backend
  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(`/api/messages?sessionId=${sessionId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load conversation history");
    }
  };

  // Send message to backend with streaming
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || !currentSessionId) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setError("");
    setIsLoading(true);
    setStreamingMessage("");

    // Add user message to UI immediately
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Handle Server-Sent Events streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.content) {
              accumulatedContent += data.content;
              setStreamingMessage(accumulatedContent);
            }

            if (data.done) {
              // Add complete assistant message
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: accumulatedContent,
                  timestamp: data.timestamp,
                },
              ]);
              setStreamingMessage("");
            }
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
      setStreamingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chat Sessions</h2>
          <button className="new-session-btn" onClick={createNewSession}>
            + New Chat
          </button>
        </div>
        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${
                session.id === currentSessionId ? "active" : ""
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="session-title">{session.title}</div>
              <button
                className="delete-session-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <header className="header">ChatGPT Web App</header>

        <div className="chat-container" ref={chatContainerRef}>
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-text">Start a conversation!</div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div>
                <div className="message-role">{message.role}</div>
                <div className="message-content">{message.content}</div>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="message assistant">
              <div>
                <div className="message-role">assistant</div>
                <div className="message-content">{streamingMessage}</div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="loading">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="input-container" onSubmit={sendMessage}>
          <input
            type="text"
            className="input-field"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
