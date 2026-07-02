/**
 * Spring 订单 API
 * 
 * GET /api/orders - 订单列表（Page<T> 格式）
 * GET /api/orders/:id - 订单详情
 */
const express = require('express');
const { pageResult, springError } = require('../middleware/spring-response');

const router = express.Router();

// 模拟订单数据
const orders = [
    { id: 1, orderNo: 'ORD-2026-001', customer: '张三', amount: 5999, status: 'COMPLETED', createdAt: '2026-01-10T10:00:00' },
    { id: 2, orderNo: 'ORD-2026-002', customer: '李四', amount: 399, status: 'PENDING', createdAt: '2026-02-10T10:00:00' },
    { id: 3, orderNo: 'ORD-2026-003', customer: '王五', amount: 1999, status: 'SHIPPED', createdAt: '2026-03-10T10:00:00' },
    { id: 4, orderNo: 'ORD-2026-004', customer: '赵六', amount: 99, status: 'COMPLETED', createdAt: '2026-04-10T10:00:00' },
    { id: 5, orderNo: 'ORD-2026-005', customer: '孙七', amount: 299, status: 'CANCELLED', createdAt: '2026-05-10T10:00:00' },
    { id: 6, orderNo: 'ORD-2026-006', customer: '周八', amount: 499, status: 'PENDING', createdAt: '2026-06-10T10:00:00' },
    { id: 7, orderNo: 'ORD-2026-007', customer: '吴九', amount: 199, status: 'COMPLETED', createdAt: '2026-01-20T10:00:00' },
    { id: 8, orderNo: 'ORD-2026-008', customer: '郑十', amount: 299, status: 'SHIPPED', createdAt: '2026-02-20T10:00:00' },
];

/**
 * 订单列表（分页）
 */
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const result = pageResult(orders, page, size);
    res.json(result);
});

/**
 * 订单详情
 */
router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json(springError(404, 'Order not found', req.path));
    }
    res.json(order);
});

module.exports = router;
