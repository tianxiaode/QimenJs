/**
 * OAuth2 认证服务
 * 
 * 端口：3000
 * 
 * 端点：
 * - POST /oauth2/token          - Token 端点（密码/授权码/客户端凭证/刷新）
 * - GET  /oauth2/authorize      - 授权端点（授权码模式）
 * - POST /oauth2/authorize      - 授权确认
 * - POST /oauth2/revoke         - 撤销端点
 * - GET  /userinfo              - 用户信息（需 Bearer Token）
 */
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./utils');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/oauth2', require('./routes/token'));
app.use('/oauth2', require('./routes/authorize'));
app.use('/oauth2', require('./routes/revoke'));

// 用户信息端点
app.get('/userinfo', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const token = auth.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'invalid_token' });
    }

    res.json({
        id: decoded.sub,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
    });
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-server' });
});

app.listen(PORT, () => {
    console.log(`[auth-server] OAuth2 认证服务运行在 http://localhost:${PORT}`);
    console.log(`[auth-server] 端点：`);
    console.log(`  POST /oauth2/token`);
    console.log(`  GET  /oauth2/authorize`);
    console.log(`  POST /oauth2/revoke`);
    console.log(`  GET  /userinfo`);
});
