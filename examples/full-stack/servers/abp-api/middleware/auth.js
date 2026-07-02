/**
 * Bearer Token 验证中间件
 * 
 * 验证 Authorization: Bearer <token> 头
 * 将解码后的用户信息挂到 req.user
 */
const { verifyToken } = require('../../auth-server/utils');

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({
            error: { code: 401, message: 'Unauthorized' },
        });
    }

    const token = auth.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({
            error: { code: 401, message: 'Invalid or expired token' },
        });
    }

    req.user = decoded;
    next();
}

module.exports = authMiddleware;
