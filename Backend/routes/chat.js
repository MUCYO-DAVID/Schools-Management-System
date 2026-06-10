const express = require('express');
const router = express.Router();
const {
  getChatResponse,
  getQuickSuggestions,
  isAiConfigured,
  getAiStatus,
} = require('../utils/aiService');
const jwt = require('jsonwebtoken');

const getOptionalUser = (req) => {
  try {
    let token = req.header('x-auth-token');
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.user;
    }
  } catch {
    // Unauthenticated or invalid token is allowed for public chat
  }
  return null;
};

const validateConversationHistory = (history) => {
  if (!history) return [];
  if (!Array.isArray(history)) return null;
  return history;
};

// POST /api/chat — Send message to AI (Groq)
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory, latitude, longitude } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        error: 'validation_error',
      });
    }

    if (message.length > 8000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please shorten it and try again.',
        error: 'message_too_long',
      });
    }

    const history = validateConversationHistory(conversationHistory);
    if (history === null) {
      return res.status(400).json({
        success: false,
        message: 'conversationHistory must be an array',
        error: 'validation_error',
      });
    }

    const user = getOptionalUser(req);
    const userRole = user?.role || 'guest';

    const userContext = {};
    if (user) {
      userContext.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      userContext.email = user.email;
    }

    const startTime = Date.now();
    const geoContext = {};
    if (latitude != null && longitude != null) {
      geoContext.latitude = latitude;
      geoContext.longitude = longitude;
    }

    const aiResponse = await getChatResponse(message, history, userRole, userContext, geoContext);
    const responseTime = Date.now() - startTime;

    if (!aiResponse.success) {
      const statusCode =
        aiResponse.error === 'validation_error' || aiResponse.error === 'invalid_request'
          ? 400
          : aiResponse.error === 'config_error'
            ? 503
            : aiResponse.error === 'rate_limit'
              ? 429
              : 502;

      return res.status(statusCode).json({
        ...aiResponse,
        responseTime,
        userRole,
        fallbackMode: false,
      });
    }

    return res.json({
      success: true,
      message: aiResponse.message,
      tokens: aiResponse.tokens,
      model: aiResponse.model,
      provider: aiResponse.provider,
      responseTime,
      userRole,
      fallbackMode: false,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'server_error',
    });
  }
});

// GET /api/chat/suggestions
router.get('/chat/suggestions', (req, res) => {
  try {
    const user = getOptionalUser(req);
    const userRole = user?.role || 'guest';
    const suggestions = getQuickSuggestions(userRole);

    return res.json({
      success: true,
      suggestions,
      userRole,
    });
  } catch (error) {
    console.error('Suggestions endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load suggestions',
      error: 'server_error',
    });
  }
});

// GET /api/chat/health
router.get('/chat/health', (req, res) => {
  const status = getAiStatus();
  return res.json({
    success: true,
    available: status.configured,
    provider: status.provider,
    model: status.model,
    aiEngine: 'groq-only',
    fallbackMode: false,
    gitCommit: process.env.RENDER_GIT_COMMIT || null,
    message: status.configured
      ? `AI service ready (${status.provider} / ${status.model})`
      : 'AI service not configured — set GROQ_API_KEY',
  });
});

module.exports = router;
