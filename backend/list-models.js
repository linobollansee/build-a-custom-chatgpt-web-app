require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function listModels() {
  try {
    const models = await openai.models.list();

    // Filter for GPT chat models
    const chatModels = models.data
      .filter((model) => model.id.includes("gpt"))
      .map((model) => model.id)
      .sort();

    console.log("Available GPT Models:");
    console.log("====================");
    chatModels.forEach((model) => console.log(model));

    console.log("\nAll Models:");
    console.log("===========");
    models.data.forEach((model) => console.log(model.id));
  } catch (error) {
    console.error("Error fetching models:", error.message);
  }
}

listModels();
