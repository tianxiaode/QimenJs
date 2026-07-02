/**
 * Bearer Token 验证中间件（与 ABP 共用同一套 JWT）
 */
const { verifyToken } = require('../../auth-server/utils');

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Full authentication is required',
            path: req.path,
        });
    }

    const token = auth.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({
            timestamp: new Date().toISOString(),
            status: 401,
            error: 'Unauthorized',
            message: 'Invalid or expired token',
            path: req.path,
        });
    }

    req.user = decoded;
    next();
}

module.exports = authMiddleware;
