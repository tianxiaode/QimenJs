/**
 * 模拟 Spring Boot 后端 API
 * 
 * 端口：3002
 * 
 * 端点：
 * - GET /api/orders          - 订单列表（Page<T>）
 * - GET /api/orders/:id      - 订单详情
 * - GET /api/items           - 商品列表（Page<T>）
 * - GET /api/items/:id       - 商品详情
 */
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查（不需要认证）
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'spring-api' });
});

// API 路由（需要认证）
app.use('/api/orders', authMiddleware, require('./routes/orders'));
app.use('/api/items', authMiddleware, require('./routes/items'));

app.listen(PORT, () => {
    console.log(`[spring-api] Spring 模拟后端运行在 http://localhost:${PORT}`);
    console.log(`[spring-api] 端点：`);
    console.log(`  GET  /api/orders`);
    console.log(`  GET  /api/orders/:id`);
    console.log(`  GET  /api/items`);
    console.log(`  GET  /api/items/:id`);
});
