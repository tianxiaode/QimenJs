/**
 * ABP 产品 API
 * 
 * GET /api/app/product - 产品列表（PagedResultDto 格式）
 * GET /api/app/product/:id - 产品详情
 */
const express = require('express');
const { pagedResult, abpError } = require('../middleware/abp-response');

const router = express.Router();

// 模拟产品数据
const products = [
    { id: 1, name: '笔记本电脑', price: 5999, stock: 100, category: '电子产品', creationTime: '2026-01-15T00:00:00' },
    { id: 2, name: '机械键盘', price: 399, stock: 200, category: '电子产品', creationTime: '2026-02-15T00:00:00' },
    { id: 3, name: '显示器', price: 1999, stock: 50, category: '电子产品', creationTime: '2026-03-15T00:00:00' },
    { id: 4, name: '鼠标', price: 99, stock: 500, category: '电子产品', creationTime: '2026-04-15T00:00:00' },
    { id: 5, name: '耳机', price: 299, stock: 150, category: '电子产品', creationTime: '2026-05-15T00:00:00' },
    { id: 6, name: '摄像头', price: 199, stock: 80, category: '电子产品', creationTime: '2026-06-15T00:00:00' },
    { id: 7, name: '音箱', price: 499, stock: 60, category: '电子产品', creationTime: '2026-01-20T00:00:00' },
    { id: 8, name: '路由器', price: 299, stock: 120, category: '网络设备', creationTime: '2026-02-20T00:00:00' },
];

/**
 * 产品列表（分页）
 */
router.get('/', (req, res) => {
    const skipCount = parseInt(req.query.skipCount) || 0;
    const maxResultCount = parseInt(req.query.maxResultCount) || 10;

    const result = pagedResult(products, skipCount, maxResultCount);
    res.json(result);
});

/**
 * 产品详情
 */
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json(abpError(404, 'Product not found'));
    }
    res.json(product);
});

module.exports = router;
