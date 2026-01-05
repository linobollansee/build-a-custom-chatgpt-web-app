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
  const [selectedModel, setSelectedModel] = useState("gpt-5-mini");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatContainerRef = useRef(null);

  // OpenAI API Parameters
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(null);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [stopSequences, setStopSequences] = useState("");
  const [n, setN] = useState(1);
  const [seed, setSeed] = useState(null);
  const [logprobs, setLogprobs] = useState(false);
  const [topLogprobs, setTopLogprobs] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Available AI models (Chat-capable only, sorted by release date - newest first)
  const availableModels = [
    // GPT-5.2 Series (December 2025 - Latest)
    { id: "gpt-5.2-chat-latest", name: "GPT-5.2 Chat Latest" },
    { id: "gpt-5.2", name: "GPT-5.2" },
    { id: "gpt-5.2-2025-12-11", name: "GPT-5.2 (2025-12-11)" },
    { id: "gpt-5.2-pro", name: "GPT-5.2 Pro" },
    { id: "gpt-5.2-pro-2025-12-11", name: "GPT-5.2 Pro (2025-12-11)" },

    // GPT-5.1 Series (November 2025)
    { id: "gpt-5.1-chat-latest", name: "GPT-5.1 Chat Latest" },
    { id: "gpt-5.1", name: "GPT-5.1" },
    { id: "gpt-5.1-2025-11-13", name: "GPT-5.1 (2025-11-13)" },

    // GPT-5 Series (August 2025)
    { id: "gpt-5-chat-latest", name: "GPT-5 Chat Latest" },
    { id: "gpt-5", name: "GPT-5" },
    { id: "gpt-5-2025-08-07", name: "GPT-5 (2025-08-07)" },
    { id: "gpt-5-pro", name: "GPT-5 Pro" },
    { id: "gpt-5-pro-2025-10-06", name: "GPT-5 Pro (2025-10-06)" },
    { id: "gpt-5-mini", name: "GPT-5 mini" },
    { id: "gpt-5-mini-2025-08-07", name: "GPT-5 mini (2025-08-07)" },
    { id: "gpt-5-nano", name: "GPT-5 nano" },
    { id: "gpt-5-nano-2025-08-07", name: "GPT-5 nano (2025-08-07)" },

    // O4 Series (April 2025)
    { id: "o4-mini", name: "o4-mini" },
    { id: "o4-mini-2025-04-16", name: "o4-mini (2025-04-16)" },

    // O3 Series (April 2025)
    { id: "o3", name: "o3" },
    { id: "o3-2025-04-16", name: "o3 (2025-04-16)" },
    { id: "o3-mini", name: "o3-mini" },
    { id: "o3-mini-2025-01-31", name: "o3-mini (2025-01-31)" },

    // O1 Series (March 2025)
    { id: "o1-pro", name: "o1-pro" },
    { id: "o1-pro-2025-03-19", name: "o1-pro (2025-03-19)" },
    { id: "o1", name: "o1" },
    { id: "o1-2024-12-17", name: "o1 (2024-12-17)" },

    // GPT-4.1 Series (April 2025)
    { id: "gpt-4.1", name: "GPT-4.1" },
    { id: "gpt-4.1-2025-04-14", name: "GPT-4.1 (2025-04-14)" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 mini" },
    { id: "gpt-4.1-mini-2025-04-14", name: "GPT-4.1 mini (2025-04-14)" },
    { id: "gpt-4.1-nano", name: "GPT-4.1 nano" },
    { id: "gpt-4.1-nano-2025-04-14", name: "GPT-4.1 nano (2025-04-14)" },

    // GPT-4o Series (November 2024)
    { id: "chatgpt-4o-latest", name: "ChatGPT-4o Latest" },
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-2024-11-20", name: "GPT-4o (2024-11-20)" },
    { id: "gpt-4o-2024-08-06", name: "GPT-4o (2024-08-06)" },
    { id: "gpt-4o-2024-05-13", name: "GPT-4o (2024-05-13)" },
    { id: "gpt-4o-mini", name: "GPT-4o mini" },
    { id: "gpt-4o-mini-2024-07-18", name: "GPT-4o mini (2024-07-18)" },

    // GPT-4 Turbo Series (April 2024)
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-4-turbo-2024-04-09", name: "GPT-4 Turbo (2024-04-09)" },
    { id: "gpt-4-turbo-preview", name: "GPT-4 Turbo Preview" },
    { id: "gpt-4-0125-preview", name: "GPT-4 (0125-preview)" },
    { id: "gpt-4-1106-preview", name: "GPT-4 (1106-preview)" },

    // GPT-4 Series (June 2023)
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-4-0613", name: "GPT-4 (0613)" },

    // GPT-3.5 Series
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "gpt-3.5-turbo-0125", name: "GPT-3.5 Turbo (0125)" },
    { id: "gpt-3.5-turbo-1106", name: "GPT-3.5 Turbo (1106)" },
    { id: "gpt-3.5-turbo-16k", name: "GPT-3.5 Turbo 16K" },
  ];

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
          model: selectedModel,
          temperature: temperature,
          maxTokens: maxTokens,
          topP: topP,
          frequencyPenalty: frequencyPenalty,
          presencePenalty: presencePenalty,
          systemPrompt: systemPrompt,
          stop: stopSequences
            ? stopSequences
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : [],
          n: n,
          seed: seed,
          logprobs: logprobs,
          topLogprobs: logprobs && topLogprobs ? topLogprobs : null,
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
                  model: selectedModel,
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
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
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
              onClick={() => {
                setCurrentSessionId(session.id);
                setSidebarOpen(false);
              }}
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
        <header className="header">
          <h1>ChatGPT Web App</h1>
          <div className="model-selector">
            <label htmlFor="model-select">Model: </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="settings-panel">
          <button
            className="toggle-settings-btn"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            {showAdvancedSettings ? "▼" : "▶"} OpenAI API Settings
          </button>

          {showAdvancedSettings && (
            <div className="advanced-settings">
              <div className="settings-section">
                <h3>System Prompt</h3>
                <textarea
                  className="system-prompt-input"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt (optional)..."
                  rows="3"
                  disabled={isLoading}
                />
              </div>

              <div className="settings-section">
                <h3>Response Parameters</h3>

                <div className="setting-item">
                  <label>
                    Temperature: {temperature}
                    <span className="setting-help">
                      Controls randomness (0-2)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    Max Tokens: {maxTokens || "Default"}
                    <span className="setting-help">
                      Maximum response length
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="128000"
                    value={maxTokens || ""}
                    onChange={(e) =>
                      setMaxTokens(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="Default (model dependent)"
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    Top P: {topP}
                    <span className="setting-help">Nucleus sampling (0-1)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    Frequency Penalty: {frequencyPenalty}
                    <span className="setting-help">
                      Reduces repetition (-2 to 2)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={frequencyPenalty}
                    onChange={(e) =>
                      setFrequencyPenalty(parseFloat(e.target.value))
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    Presence Penalty: {presencePenalty}
                    <span className="setting-help">
                      Encourages new topics (-2 to 2)
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={presencePenalty}
                    onChange={(e) =>
                      setPresencePenalty(parseFloat(e.target.value))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3>Advanced Options</h3>

                <div className="setting-item">
                  <label>
                    Stop Sequences
                    <span className="setting-help">Comma-separated values</span>
                  </label>
                  <input
                    type="text"
                    value={stopSequences}
                    onChange={(e) => setStopSequences(e.target.value)}
                    placeholder="e.g., \n, END, ---"
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    N (Number of completions): {n}
                    <span className="setting-help">
                      Generate multiple responses (1-10)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={n}
                    onChange={(e) => setN(parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    Seed
                    <span className="setting-help">
                      For deterministic outputs
                    </span>
                  </label>
                  <input
                    type="number"
                    value={seed || ""}
                    onChange={(e) =>
                      setSeed(e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Random (optional)"
                    disabled={isLoading}
                  />
                </div>

                <div className="setting-item checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={logprobs}
                      onChange={(e) => setLogprobs(e.target.checked)}
                      disabled={isLoading}
                    />
                    Enable Logprobs
                    <span className="setting-help">
                      Include token log probabilities
                    </span>
                  </label>
                </div>

                {logprobs && (
                  <div className="setting-item">
                    <label>
                      Top Logprobs: {topLogprobs || "None"}
                      <span className="setting-help">
                        Number of top tokens (0-20)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={topLogprobs || ""}
                      onChange={(e) =>
                        setTopLogprobs(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      placeholder="0-20"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="setting-item">
                  <button
                    className="reset-settings-btn"
                    onClick={() => {
                      setTemperature(1);
                      setMaxTokens(null);
                      setTopP(1);
                      setFrequencyPenalty(0);
                      setPresencePenalty(0);
                      setSystemPrompt("");
                      setStopSequences("");
                      setN(1);
                      setSeed(null);
                      setLogprobs(false);
                      setTopLogprobs(null);
                    }}
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

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
                <div className="message-role">
                  {message.role === "assistant" && message.model
                    ? message.model
                    : message.role === "assistant"
                    ? selectedModel
                    : message.role}
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="message assistant">
              <div>
                <div className="message-role">{selectedModel}</div>
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
