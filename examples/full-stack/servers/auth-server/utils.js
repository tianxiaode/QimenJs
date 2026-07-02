/**
 * Token 生成与验证工具
 * 
 * 使用 jsonwebtoken 模拟 JWT 签发
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'orbitjs-demo-secret';
const ACCESS_TOKEN_EXPIRES = 3600;       // 1 小时
const REFRESH_TOKEN_EXPIRES = 86400 * 7; // 7 天

/**
 * 生成 Access Token
 */
function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
}

/**
 * 生成 Refresh Token
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES }
    );
}

/**
 * 验证 Token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * 生成授权码（6 位随机字符串）
 */
function generateAuthorizationCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, generateAuthorizationCode, ACCESS_TOKEN_EXPIRES };
