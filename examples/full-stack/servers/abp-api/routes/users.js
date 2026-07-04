/**
 * ABP 用户 API
 * 
 * GET /api/app/user - 用户列表（PagedResultDto 格式）
 * GET /api/app/user/:id - 用户详情
 * POST /api/app/user - 创建用户（带验证错误示例）
 */
const express = require('express');
const { pagedResult, abpError } = require('../middleware/abp-response');

const router = express.Router();

// 模拟用户数据
const users = [
    { id: 1, userName: 'admin', name: '管理员', email: 'admin@example.com', isActive: true, creationTime: '2026-01-01T00:00:00' },
    { id: 2, userName: 'user', name: '普通用户', email: 'user@example.com', isActive: true, creationTime: '2026-02-01T00:00:00' },
    { id: 3, userName: 'guest', name: '访客', email: 'guest@example.com', isActive: false, creationTime: '2026-03-01T00:00:00' },
    { id: 4, userName: 'alice', name: 'Alice', email: 'alice@example.com', isActive: true, creationTime: '2026-04-01T00:00:00' },
    { id: 5, userName: 'bob', name: 'Bob', email: 'bob@example.com', isActive: true, creationTime: '2026-05-01T00:00:00' },
    { id: 6, userName: 'charlie', name: 'Charlie', email: 'charlie@example.com', isActive: false, creationTime: '2026-06-01T00:00:00' },
];

/**
 * 用户列表（分页）
 */
router.get('/', (req, res) => {
    const skipCount = parseInt(req.query.skipCount) || 0;
    const maxResultCount = parseInt(req.query.maxResultCount) || 10;
    const filter = req.query.filter || '';
    const sorting = req.query.sorting || '';

    // 搜索过滤
    let filtered = users;
    if (filter) {
        const k = filter.toLowerCase();
        filtered = filtered.filter(u =>
            u.userName.toLowerCase().includes(k) ||
            u.name.toLowerCase().includes(k) ||
            u.email.toLowerCase().includes(k)
        );
    }

    // 排序
    if (sorting) {
        const [field, dir] = sorting.split(' ');
        filtered = [...filtered].sort((a, b) => {
            const va = (a[field] || '').toString().toLowerCase();
            const vb = (b[field] || '').toString().toLowerCase();
            const cmp = va.localeCompare(vb);
            return dir === 'DESC' ? -cmp : cmp;
        });
    }

    const result = pagedResult(filtered, skipCount, maxResultCount);
    res.json(result);
});

/**
 * 用户详情
 */
router.get('/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json(abpError(404, 'User not found'));
    }
    res.json(user);
});

/**
 * 创建用户（带验证错误示例）
 */
router.post('/', (req, res) => {
    const { userName, email, name } = req.body;

    // 模拟验证错误
    const validationErrors = [];
    if (!userName) {
        validationErrors.push({ message: '用户名不能为空', members: ['userName'] });
    }
    if (!email) {
        validationErrors.push({ message: '邮箱不能为空', members: ['email'] });
    }
    if (userName && userName.length < 3) {
        validationErrors.push({ message: '用户名至少3个字符', members: ['userName'] });
    }

    if (validationErrors.length > 0) {
        return res.status(400).json(abpError(400, '验证失败', validationErrors));
    }

    const newUser = {
        id: users.length + 1,
        userName,
        name: name || userName,
        email,
        isActive: true,
        creationTime: new Date().toISOString(),
    };
    users.push(newUser);

    res.status(201).json(newUser);
});

module.exports = router;
