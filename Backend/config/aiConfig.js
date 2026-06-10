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

const stripQuotes = (value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const getGroqApiKey = () => stripQuotes(process.env.GROQ_API_KEY);

module.exports = {
  provider: (process.env.AI_PROVIDER || 'groq').toLowerCase(),

  get groq() {
    return {
      apiKey: getGroqApiKey(),
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      fallbackModels: [
        process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
      ].filter((m, i, arr) => m && arr.indexOf(m) === i),
      maxTokens: parseIntSafe(process.env.GROQ_MAX_TOKENS, 1024),
      temperature: parseFloatSafe(process.env.GROQ_TEMPERATURE, 0.7),
    };
  },

  /** Max prior turns sent as context (user + assistant pairs) */
  maxHistoryMessages: parseIntSafe(process.env.AI_MAX_HISTORY_MESSAGES, 10),

  /** Cap single message length to control token usage */
  maxMessageLength: parseIntSafe(process.env.AI_MAX_MESSAGE_LENGTH, 4000),
};
