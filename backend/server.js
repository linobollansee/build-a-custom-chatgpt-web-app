require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { saveMessage, getAllMessages } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle chat messages
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message to database
    saveMessage("user", message);

    // Get conversation history from database
    const history = getAllMessages();

    // Format messages for OpenAI API
    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call ChatGPT API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const assistantResponse = completion.choices[0].message.content;

    // Save assistant response to database
    saveMessage("assistant", assistantResponse);

    // Return response
    res.json({
      message: assistantResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
});

// Endpoint to get conversation history
app.get("/api/messages", async (req, res) => {
  try {
    const messages = getAllMessages();
    res.json({
      messages: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error in /api/messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
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
  console.log(`  POST http://localhost:${PORT}/api/chat`);
  console.log(`  GET  http://localhost:${PORT}/api/messages`);
});
