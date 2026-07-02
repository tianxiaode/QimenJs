/**
 * 模拟用户数据库
 */
const users = [
    { id: 1, username: 'admin', password: '123456', name: '管理员', role: 'admin' },
    { id: 2, username: 'user', password: '123456', name: '普通用户', role: 'user' },
    { id: 3, username: 'guest', password: '123456', name: '访客', role: 'guest' },
];

/**
 * 模拟客户端注册表
 */
const clients = [
    { clientId: 'orbitjs-demo', clientSecret: 'demo-secret', redirectUris: ['http://localhost:5173/callback'] },
];

/**
 * 模拟授权码存储
 */
const authorizationCodes = new Map();

/**
 * 模拟 Token 存储
 */
const tokens = new Map();

module.exports = { users, clients, authorizationCodes, tokens };
