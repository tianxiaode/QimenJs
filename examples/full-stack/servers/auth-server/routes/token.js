/**
 * OAuth2 Token 端点
 * 
 * 支持：password / authorization_code / client_credentials / refresh_token
 */
const express = require('express');
const { users, clients, authorizationCodes, tokens } = require('../db');
const { generateAccessToken, generateRefreshToken, verifyToken, ACCESS_TOKEN_EXPIRES } = require('../utils');

const router = express.Router();

router.post('/token', (req, res) => {
    const { grant_type } = req.body;

    switch (grant_type) {
        case 'password':
            return handlePasswordGrant(req, res);
        case 'authorization_code':
            return handleAuthorizationCodeGrant(req, res);
        case 'client_credentials':
            return handleClientCredentialsGrant(req, res);
        case 'refresh_token':
            return handleRefreshTokenGrant(req, res);
        default:
            return res.status(400).json({
                error: 'unsupported_grant_type',
                error_description: `Grant type '${grant_type}' is not supported`,
            });
    }
});

/**
 * 密码模式
 */
function handlePasswordGrant(req, res) {
    const { username, password, client_id, client_secret } = req.body;

    // 验证客户端
    const client = clients.find(c => c.clientId === client_id);
    if (!client) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Unknown client',
        });
    }

    // 验证用户
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({
            error: 'invalid_grant',
            error_description: 'Invalid username or password',
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 存储 token
    tokens.set(accessToken, { userId: user.id, type: 'access' });
    tokens.set(refreshToken, { userId: user.id, type: 'refresh' });

    res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRES,
        refresh_token: refreshToken,
    });
}

/**
 * 授权码模式
 */
function handleAuthorizationCodeGrant(req, res) {
    const { code, redirect_uri, client_id } = req.body;

    // 验证客户端
    const client = clients.find(c => c.clientId === client_id);
    if (!client) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Unknown client',
        });
    }

    // 验证授权码
    const codeData = authorizationCodes.get(code);
    if (!codeData) {
        return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid authorization code',
        });
    }

    // 验证 redirect_uri
    if (codeData.redirectUri !== redirect_uri) {
        return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Redirect URI mismatch',
        });
    }

    // 删除已使用的授权码
    authorizationCodes.delete(code);

    const user = users.find(u => u.id === codeData.userId);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    tokens.set(accessToken, { userId: user.id, type: 'access' });
    tokens.set(refreshToken, { userId: user.id, type: 'refresh' });

    res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRES,
        refresh_token: refreshToken,
    });
}

/**
 * 客户端凭证模式
 */
function handleClientCredentialsGrant(req, res) {
    const { client_id, client_secret } = req.body;

    const client = clients.find(c => c.clientId === client_id && c.clientSecret === client_secret);
    if (!client) {
        return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Invalid client credentials',
        });
    }

    const accessToken = generateAccessToken({ id: 0, username: client_id, name: 'Service', role: 'service' });
    tokens.set(accessToken, { clientId: client_id, type: 'access' });

    res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRES,
    });
}

/**
 * 刷新 Token
 */
function handleRefreshTokenGrant(req, res) {
    const { refresh_token, client_id } = req.body;

    // 验证 refresh token
    const decoded = verifyToken(refresh_token);
    if (!decoded || decoded.type !== 'refresh') {
        return res.status(401).json({
            error: 'invalid_grant',
            error_description: 'Invalid refresh token',
        });
    }

    // 检查是否在存储中
    if (!tokens.has(refresh_token)) {
        return res.status(401).json({
            error: 'invalid_grant',
            error_description: 'Refresh token has been revoked',
        });
    }

    // 删除旧的 refresh token（轮换）
    tokens.delete(refresh_token);

    const user = users.find(u => u.id === decoded.sub);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    tokens.set(newAccessToken, { userId: user.id, type: 'access' });
    tokens.set(newRefreshToken, { userId: user.id, type: 'refresh' });

    res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_EXPIRES,
        refresh_token: newRefreshToken,
    });
}

module.exports = router;
