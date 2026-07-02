/**
 * 仪表盘页
 *
 * 展示三个域的数据：ABP 用户/产品、Spring 订单/商品
 * 通过 EntityManager 获取数据，展示 OrbitJS 的实体管理能力
 */
import { oauth2 } from '../config';
import { AbpUserManager, AbpProductManager, SpringOrderManager, SpringItemManager } from '../managers';
import { render, card, table, button, badge, loading, error } from '../utils/render';

// 创建 EntityManager 实例
const abpUserManager = new AbpUserManager();
const abpProductManager = new AbpProductManager();
const springOrderManager = new SpringOrderManager();
const springItemManager = new SpringItemManager();

export function showDashboard(): void {
    render('app', `
        <div style="max-width: 1200px; margin: 20px auto; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h1>OrbitJS 全栈示例</h1>
                <div>
                    <span id="auth-status"></span>
                    ${button('登出', 'window.__logout()', '#f44336')}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    ${card('ABP 域 - 用户列表', '<div id="abp-users">' + loading() + '</div>', '#4CAF50')}
                    ${card('ABP 域 - 产品列表', '<div id="abp-products">' + loading() + '</div>', '#4CAF50')}
                </div>
                <div>
                    ${card('Spring 域 - 订单列表', '<div id="spring-orders">' + loading() + '</div>', '#2196F3')}
                    ${card('Spring 域 - 商品列表', '<div id="spring-items">' + loading() + '</div>', '#2196F3')}
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                ${card('操作测试', `
                    ${button('刷新 ABP 用户', 'window.__fetchAbpUsers()', '#4CAF50')}
                    ${button('刷新 Spring 订单', 'window.__fetchSpringOrders()', '#2196F3')}
                    ${button('创建 ABP 用户（验证错误测试）', 'window.__createAbpUser()', '#FF9800')}
                    <div id="action-result" style="margin-top: 8px;"></div>
                `, '#9C27B0')}
            </div>
        </div>
    `);

    // 显示认证状态
    const authStatus = document.getElementById('auth-status')!;
    if (oauth2.isAuthenticated()) {
        authStatus.innerHTML = badge('已认证', '#4CAF50');
    } else {
        authStatus.innerHTML = badge('未认证', '#f44336');
    }

    // 加载数据
    fetchAbpUsers();
    fetchAbpProducts();
    fetchSpringOrders();
    fetchSpringItems();
}

// ===== ABP 域数据 =====

async function fetchAbpUsers(): Promise<void> {
    const container = document.getElementById('abp-users');
    if (!container) return;

    try {
        // 通过 EntityManager 的 list 能力获取数据
        const items = await abpUserManager.list();
        const state = abpUserManager.state;

        container.innerHTML = table(
            ['ID', '用户名', '姓名', '邮箱', '状态'],
            items.map((u: any) => [
                u.id,
                u.userName,
                u.name,
                u.email,
                u.isActive ? badge('活跃', '#4CAF50') : badge('禁用', '#999'),
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${state.total} 条</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

async function fetchAbpProducts(): Promise<void> {
    const container = document.getElementById('abp-products');
    if (!container) return;

    try {
        const items = await abpProductManager.list();
        const state = abpProductManager.state;

        container.innerHTML = table(
            ['ID', '名称', '价格', '库存', '分类'],
            items.map((p: any) => [
                p.id,
                p.name,
                '¥' + p.price,
                p.stock,
                p.category,
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${state.total} 条</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

// ===== Spring 域数据 =====

async function fetchSpringOrders(): Promise<void> {
    const container = document.getElementById('spring-orders');
    if (!container) return;

    try {
        const items = await springOrderManager.list();
        const state = springOrderManager.state;

        container.innerHTML = table(
            ['ID', '订单号', '客户', '金额', '状态'],
            items.map((o: any) => [
                o.id,
                o.orderNo,
                o.customer,
                '¥' + o.amount,
                badge(o.status, statusColor(o.status)),
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${state.total} 条，第 ${state.page}/${state.pages} 页</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

async function fetchSpringItems(): Promise<void> {
    const container = document.getElementById('spring-items');
    if (!container) return;

    try {
        const items = await springItemManager.list();
        const state = springItemManager.state;

        container.innerHTML = table(
            ['ID', '名称', '价格', '库存', '分类'],
            items.map((i: any) => [
                i.id,
                i.name,
                '¥' + i.price,
                i.stock,
                i.category,
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${state.total} 条</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

// ===== 辅助函数 =====

function statusColor(status: string): string {
    const colors: Record<string, string> = {
        COMPLETED: '#4CAF50',
        PENDING: '#FF9800',
        SHIPPED: '#2196F3',
        CANCELLED: '#f44336',
    };
    return colors[status] || '#999';
}

// ===== 暴露到 window =====

(window as any).__fetchAbpUsers = () => fetchAbpUsers();
(window as any).__fetchSpringOrders = () => fetchSpringOrders();

(window as any).__createAbpUser = async () => {
    const result = document.getElementById('action-result');
    if (!result) return;

    try {
        // 通过 EntityManager 的 create 能力创建用户
        // 故意发送空数据触发验证错误
        const item = await abpUserManager.create({});

        result.innerHTML = `<div style="padding: 8px; background: #e8f5e9; border-radius: 4px; margin-top: 8px;">创建成功: ${item.userName}</div>`;
        fetchAbpUsers();
    } catch (e: any) {
        let msg = `错误: ${e.message || '创建失败'}`;
        result.innerHTML = `<div style="padding: 8px; background: #fff3e0; border-radius: 4px; margin-top: 8px;">${msg}</div>`;
    }
};

(window as any).__logout = async () => {
    await oauth2.logout();
    const { showLoginPage } = await import('./login');
    showLoginPage();
};
