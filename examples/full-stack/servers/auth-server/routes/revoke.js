/**
 * OAuth2 撤销端点
 */
const express = require('express');
const { tokens } = require('../db');

const router = express.Router();

router.post('/revoke', (req, res) => {
    const { token } = req.body;
    if (token) {
        tokens.delete(token);
    }
    // RFC 7009: 即使 token 不存在也返回 200
    res.json({});
});

module.exports = router;
