const express = require('express');
const router = express.Router();
const { getChatResponse, getQuickSuggestions, getFallbackResponse } = require('../utils/aiService');
const jwt = require('jsonwebtoken');

// Helper to get optional user from token
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
  } catch (err) {
    // Token invalid or missing - that's okay
  }
  return null;
};

// POST /api/chat - Send message to AI
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Get user context if authenticated
    const user = getOptionalUser(req);
    const userRole = user?.role || 'guest';
    
    // Build user context
    const userContext = {};
    if (user) {
      userContext.name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      userContext.email = user.email;
      
      // Could add more context like application count, school name, etc.
      // For now, keeping it simple
    }

    console.log(`Chat request from ${userRole}: "${message.substring(0, 50)}..."`);
    
    // Get AI response
    const startTime = Date.now();
    const aiResponse = await getChatResponse(
      message,
      conversationHistory || [],
      userRole,
      userContext
    );
    const responseTime = Date.now() - startTime;
    
    console.log(`AI response time: ${responseTime}ms`);
    
    // If AI failed due to quota, use fallback responses
    if (!aiResponse.success && aiResponse.error === 'quota_exceeded') {
      console.log('Using fallback response due to quota exceeded');
      const fallbackMessage = getFallbackResponse(message, userRole);
      return res.json({
        success: true,
        message: fallbackMessage,
        responseTime,
        userRole,
        fallbackMode: true,
        notice: '⚠️ Running in limited mode - OpenAI quota exceeded'
      });
    }
    
    res.json({
      ...aiResponse,
      responseTime,
      userRole
    });
    
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/chat/suggestions - Get quick suggestions based on user role
router.get('/chat/suggestions', (req, res) => {
  try {
    const user = getOptionalUser(req);
    const userRole = user?.role || 'guest';
    
    const suggestions = getQuickSuggestions(userRole);
    
    res.json({
      success: true,
      suggestions,
      userRole
    });
    
  } catch (error) {
    console.error('Suggestions endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load suggestions'
    });
  }
});

// GET /api/chat/health - Check if AI service is available
router.get('/chat/health', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  res.json({
    success: true,
    available: hasApiKey,
    message: hasApiKey 
      ? 'AI service is available' 
      : 'AI service is not configured (missing API key)'
  });
});

module.exports = router;
