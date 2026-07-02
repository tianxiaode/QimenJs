/**
 * Spring 商品 API
 * 
 * GET /api/items - 商品列表（Page<T> 格式）
 * GET /api/items/:id - 商品详情
 */
const express = require('express');
const { pageResult, springError } = require('../middleware/spring-response');

const router = express.Router();

// 模拟商品数据
const items = [
    { id: 1, name: 'Java 编程思想', price: 89, category: '图书', stock: 100 },
    { id: 2, name: 'Spring 实战', price: 69, category: '图书', stock: 80 },
    { id: 3, name: 'Docker 入门', price: 59, category: '图书', stock: 60 },
    { id: 4, name: 'Kubernetes 指南', price: 79, category: '图书', stock: 40 },
    { id: 5, name: 'MySQL 优化', price: 49, category: '图书', stock: 120 },
    { id: 6, name: 'Redis 实战', price: 55, category: '图书', stock: 90 },
    { id: 7, name: 'Linux 命令行', price: 65, category: '图书', stock: 70 },
    { id: 8, name: 'Go 语言圣经', price: 75, category: '图书', stock: 50 },
    { id: 9, name: 'Rust 权威指南', price: 85, category: '图书', stock: 30 },
    { id: 10, name: 'Python 数据分析', price: 59, category: '图书', stock: 110 },
];

/**
 * 商品列表（分页）
 */
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const result = pageResult(items, page, size);
    res.json(result);
});

/**
 * 商品详情
 */
router.get('/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) {
        return res.status(404).json(springError(404, 'Item not found', req.path));
    }
    res.json(item);
});

module.exports = router;
