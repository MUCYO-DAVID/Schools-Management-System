const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../Backend/.env') });

const serverless = require('serverless-http');
const { createApp, ensureDb } = require('../Backend/createApp');

let handler;

module.exports = async (req, res) => {
  try {
    await ensureDb();
    if (!handler) {
      handler = serverless(createApp());
    }
    return handler(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server initialization failed' }));
  }
};
