// testGeminiModels.js
const { ModelsClient } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const client = new ModelsClient();
    const res = await client.listModels();
    console.log("All available Gemini models:");
    console.log(res);
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

listModels();
