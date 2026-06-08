const Groq = require('groq-sdk');
const aiConfig = require('../config/aiConfig');

let client = null;

const getClient = () => {
  if (!aiConfig.groq.apiKey) {
    return null;
  }
  if (!client) {
    client = new Groq({ apiKey: aiConfig.groq.apiKey });
  }
  return client;
};

const isConfigured = () => Boolean(aiConfig.groq.apiKey);

/**
 * @param {{ messages: Array<{role: string, content: string}>, maxTokens?: number, temperature?: number }} params
 */
const createChatCompletion = async ({ messages, maxTokens, temperature }) => {
  const groq = getClient();
  if (!groq) {
    const error = new Error('GROQ_API_KEY is not configured');
    error.code = 'config_error';
    error.status = 503;
    throw error;
  }

  return groq.chat.completions.create({
    model: aiConfig.groq.model,
    messages,
    max_tokens: maxTokens ?? aiConfig.groq.maxTokens,
    temperature: temperature ?? aiConfig.groq.temperature,
  });
};

module.exports = {
  name: 'groq',
  isConfigured,
  createChatCompletion,
};
