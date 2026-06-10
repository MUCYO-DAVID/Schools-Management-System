const Groq = require('groq-sdk');
const aiConfig = require('../config/aiConfig');

let client = null;
let lastClientKey = null;

const getClient = () => {
  const apiKey = aiConfig.groq.apiKey;
  if (!apiKey) {
    return null;
  }
  if (!client || lastClientKey !== apiKey) {
    client = new Groq({ apiKey });
    lastClientKey = apiKey;
  }
  return client;
};

const isConfigured = () => Boolean(aiConfig.groq.apiKey);

const parseGroqError = (error) => {
  const status = error?.status || error?.response?.status;
  const code = error?.code || error?.error?.code;
  const message =
    error?.error?.message ||
    error?.message ||
    'Groq API request failed';

  const wrapped = new Error(message);
  wrapped.status = status;
  wrapped.code = code || (status === 401 ? 'invalid_api_key' : undefined);
  return wrapped;
};

/**
 * @param {{ messages: Array<{role: string, content: string}>, maxTokens?: number, temperature?: number }} params
 */
const createChatCompletion = async ({ messages, maxTokens, temperature }) => {
  const groq = getClient();
  if (!groq) {
    const error = new Error('GROQ_API_KEY is not configured on the server');
    error.code = 'config_error';
    error.status = 503;
    throw error;
  }

  const models = aiConfig.groq.fallbackModels;
  let lastError = null;

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens ?? aiConfig.groq.maxTokens,
        temperature: temperature ?? aiConfig.groq.temperature,
      });
      console.log(`[Groq] Success with model: ${model}`);
      return completion;
    } catch (error) {
      lastError = error;
      console.error(`[Groq] Model ${model} failed:`, error?.message || error);
    }
  }

  throw parseGroqError(lastError);
};

module.exports = {
  name: 'groq',
  isConfigured,
  createChatCompletion,
};
