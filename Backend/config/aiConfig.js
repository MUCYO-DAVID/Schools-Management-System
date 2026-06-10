/**
 * Central AI configuration — switch providers/models via environment variables.
 */
const parseIntSafe = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseFloatSafe = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  provider: (process.env.AI_PROVIDER || 'groq').toLowerCase(),

  groq: {
    apiKey: (process.env.GROQ_API_KEY || '').trim(),
    /** Fast default; override with GROQ_MODEL e.g. llama-3.3-70b-versatile for higher quality */
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    maxTokens: parseIntSafe(process.env.GROQ_MAX_TOKENS, 280),
    temperature: parseFloatSafe(process.env.GROQ_TEMPERATURE, 0.7),
  },

  /** Max prior turns sent as context (user + assistant pairs) */
  maxHistoryMessages: parseIntSafe(process.env.AI_MAX_HISTORY_MESSAGES, 10),

  /** Cap single message length to control token usage */
  maxMessageLength: parseIntSafe(process.env.AI_MAX_MESSAGE_LENGTH, 4000),
};
