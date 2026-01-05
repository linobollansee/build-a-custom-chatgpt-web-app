require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const {
  createSession,
  getAllSessions,
  getSession,
  deleteSession,
  saveMessage,
  getSessionMessages,
  getAllMessages,
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle chat messages with streaming
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      sessionId,
      model,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      systemPrompt,
      stop,
      n,
      logitBias,
      user,
      seed,
      topLogprobs,
      logprobs,
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Use provided model or default to gpt-3.5-turbo
    const selectedModel = model || "gpt-3.5-turbo";

    console.log(
      `[Chat API] Using model: ${selectedModel} for session: ${sessionId}`
    );

    // Verify session exists
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Save user message to database
    saveMessage(sessionId, "user", message);

    // Get conversation history from database
    const history = getSessionMessages(sessionId);

    // Format messages for OpenAI API
    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Prepend system message if provided
    if (systemPrompt && systemPrompt.trim()) {
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }

    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Build API parameters
    const apiParams = {
      model: selectedModel,
      messages: messages,
      stream: true,
    };

    // Add optional parameters if provided
    if (temperature !== undefined && temperature !== null)
      apiParams.temperature = parseFloat(temperature);
    if (maxTokens !== undefined && maxTokens !== null)
      apiParams.max_tokens = parseInt(maxTokens);
    if (topP !== undefined && topP !== null) apiParams.top_p = parseFloat(topP);
    if (frequencyPenalty !== undefined && frequencyPenalty !== null)
      apiParams.frequency_penalty = parseFloat(frequencyPenalty);
    if (presencePenalty !== undefined && presencePenalty !== null)
      apiParams.presence_penalty = parseFloat(presencePenalty);
    if (stop && stop.length > 0) apiParams.stop = stop;
    if (n !== undefined && n !== null) apiParams.n = parseInt(n);
    if (logitBias && Object.keys(logitBias).length > 0)
      apiParams.logit_bias = logitBias;
    if (user) apiParams.user = user;
    if (seed !== undefined && seed !== null) apiParams.seed = parseInt(seed);
    if (logprobs !== undefined && logprobs !== null)
      apiParams.logprobs = logprobs;
    if (topLogprobs !== undefined && topLogprobs !== null)
      apiParams.top_logprobs = parseInt(topLogprobs);

    // Call ChatGPT API with streaming
    const stream = await openai.chat.completions.create(apiParams);

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        // Send chunk to client
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save complete assistant response to database
    saveMessage(sessionId, "assistant", fullResponse);

    // Send completion signal
    res.write(
      `data: ${JSON.stringify({
        done: true,
        timestamp: new Date().toISOString(),
      })}\n\n`
    );
    res.end();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.write(
      `data: ${JSON.stringify({
        error: "Failed to process message",
        details: error.message,
      })}\n\n`
    );
    res.end();
  }
});

// Endpoint to get conversation history
app.get("/api/messages", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (sessionId) {
      // Get messages for specific session
      const messages = getSessionMessages(sessionId);
      res.json({
        messages: messages,
        count: messages.length,
      });
    } else {
      // Get all messages (backwards compatibility)
      const messages = getAllMessages();
      res.json({
        messages: messages,
        count: messages.length,
      });
    }
  } catch (error) {
    console.error("Error in /api/messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
      details: error.message,
    });
  }
});

// Endpoint to create a new session
app.post("/api/sessions", async (req, res) => {
  try {
    const { title } = req.body;
    const session = createSession(title || "New Chat");
    res.json(session);
  } catch (error) {
    console.error("Error in /api/sessions:", error);
    res.status(500).json({
      error: "Failed to create session",
      details: error.message,
    });
  }
});

// Endpoint to get all sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = getAllSessions();
    res.json({
      sessions: sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error("Error in /api/sessions:", error);
    res.status(500).json({
      error: "Failed to fetch sessions",
      details: error.message,
    });
  }
});

// Endpoint to delete a session
app.delete("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    deleteSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error in /api/sessions/:sessionId:", error);
    res.status(500).json({
      error: "Failed to delete session",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`  POST   http://localhost:${PORT}/api/chat`);
  console.log(`  GET    http://localhost:${PORT}/api/messages`);
  console.log(`  POST   http://localhost:${PORT}/api/sessions`);
  console.log(`  GET    http://localhost:${PORT}/api/sessions`);
  console.log(`  DELETE http://localhost:${PORT}/api/sessions/:sessionId`);
});
