const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header (support both Bearer and x-auth-token)
    let token = req.header('x-auth-token');

    // If no x-auth-token, try Authorization Bearer header
    if (!token) {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    next();
};

const leaderMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'leader') {
        return res.status(403).json({ message: 'Access denied, school leader privileges required' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, leaderMiddleware };