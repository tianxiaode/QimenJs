/**
 * 模拟 ABP 后端 API
 * 
 * 端口：3001
 * 
 * 端点：
 * - GET /api/app/user          - 用户列表（PagedResultDto）
 * - GET /api/app/user/:id      - 用户详情
 * - POST /api/app/user         - 创建用户（含验证错误）
 * - GET /api/app/product       - 产品列表（PagedResultDto）
 * - GET /api/app/product/:id   - 产品详情
 * - GET /api/departments       - 部门树列表（支持懒加载）
 * - GET /api/departments/:id   - 部门详情
 * - POST /api/departments      - 创建部门
 * - PUT /api/departments/:id   - 更新部门
 * - DELETE /api/departments/:id - 删除部门
 */
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查（不需要认证）
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'abp-api' });
});

// API 路由（需要认证）
app.use('/api/app/user', authMiddleware, require('./routes/users'));
app.use('/api/app/product', authMiddleware, require('./routes/products'));
app.use('/api/departments', authMiddleware, require('./routes/departments'));

app.listen(PORT, () => {
    console.log(`[abp-api] ABP 模拟后端运行在 http://localhost:${PORT}`);
    console.log(`[abp-api] 端点：`);
    console.log(`  GET  /api/app/user`);
    console.log(`  GET  /api/app/user/:id`);
    console.log(`  POST /api/app/user`);
    console.log(`  GET  /api/app/product`);
    console.log(`  GET  /api/app/product/:id`);
    console.log(`  GET  /api/departments (支持 ?parentId= 懒加载)`);
    console.log(`  GET  /api/departments/:id`);
    console.log(`  POST /api/departments`);
    console.log(`  PUT  /api/departments/:id`);
    console.log(`  DELETE /api/departments/:id`);
});
