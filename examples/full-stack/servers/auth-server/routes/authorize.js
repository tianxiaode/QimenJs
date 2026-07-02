/**
 * OAuth2 授权端点（授权码模式）
 * 
 * GET /oauth2/authorize - 显示授权页面
 * POST /oauth2/authorize - 用户同意授权，生成授权码并重定向
 */
const express = require('express');
const { users, clients, authorizationCodes } = require('../db');
const { generateAuthorizationCode } = require('../utils');

const router = express.Router();

/**
 * 显示授权页面
 */
router.get('/authorize', (req, res) => {
    const { response_type, client_id, redirect_uri, scope, state } = req.query;

    if (response_type !== 'code') {
        return res.status(400).json({ error: 'unsupported_response_type' });
    }

    const client = clients.find(c => c.clientId === client_id);
    if (!client) {
        return res.status(400).json({ error: 'invalid_client', error_description: 'Unknown client' });
    }

    // 简单的授权页面 HTML
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth2 授权</title></head>
        <body style="font-family: sans-serif; max-width: 400px; margin: 100px auto; text-align: center;">
            <h2>OAuth2 授权确认</h2>
            <p>应用 <strong>${client_id}</strong> 请求访问你的账户</p>
            <form method="POST" action="/oauth2/authorize">
                <input type="hidden" name="client_id" value="${client_id}">
                <input type="hidden" name="redirect_uri" value="${redirect_uri}">
                <input type="hidden" name="scope" value="${scope || ''}">
                <input type="hidden" name="state" value="${state || ''}">
                <input type="hidden" name="user_id" value="1">
                <button type="submit" name="action" value="approve" style="padding: 10px 30px; background: #4CAF50; color: white; border: none; cursor: pointer; margin: 5px;">同意授权</button>
                <button type="submit" name="action" value="deny" style="padding: 10px 30px; background: #f44336; color: white; border: none; cursor: pointer; margin: 5px;">拒绝</button>
            </form>
        </body>
        </html>
    `);
});

/**
 * 处理授权确认
 */
router.post('/authorize', (req, res) => {
    const { client_id, redirect_uri, scope, state, user_id, action } = req.body;

    if (action === 'deny') {
        const url = new URL(redirect_uri);
        url.searchParams.set('error', 'access_denied');
        if (state) url.searchParams.set('state', state);
        return res.redirect(url.toString());
    }

    // 生成授权码
    const code = generateAuthorizationCode();
    authorizationCodes.set(code, {
        userId: parseInt(user_id),
        clientId: client_id,
        redirectUri: redirect_uri,
        scope: scope,
        expiresAt: Date.now() + 60000, // 1 分钟有效
    });

    // 重定向回客户端
    const url = new URL(redirect_uri);
    url.searchParams.set('code', code);
    if (state) url.searchParams.set('state', state);
    res.redirect(url.toString());
});

module.exports = router;
