const aiConfig = require('../config/aiConfig');
const groqProvider = require('./groqProvider');

const registry = {
  groq: groqProvider,
};

const getActiveProvider = () => {
  const provider = registry[aiConfig.provider];
  if (!provider) {
    throw new Error(`Unsupported AI_PROVIDER: ${aiConfig.provider}`);
  }
  return provider;
};

const isConfigured = () => {
  try {
    return getActiveProvider().isConfigured();
  } catch {
    return false;
  }
};

module.exports = {
  getActiveProvider,
  isConfigured,
  registry,
};
