/**
 * 仪表盘页
 *
 * 展示 OrbitJS 全部 5 种 EntityManager 类型：
 * 1. RemoteCrudEntityManager      - ABP 用户（远程 CRUD）
 * 2. RemoteReadonlyEntityManager  - Spring 商品（远程只读）
 * 3. RemoteTreeEntityManager      - ABP 部门（远程树形）
 * 4. LocalReadonlyEntityManager   - 本地通知（本地只读）
 * 5. LocalCrudEntityManager       - 本地标签（本地 CRUD）
 */
import { oauth2 } from '../config';
import { AbpUserManager, AbpProductManager, SpringOrderManager, SpringItemManager, LocalNotificationManager, LocalTagManager, DepartmentManager } from '../managers';
import { render, card, table, button, badge, loading, error } from '../utils/render';

// 创建 EntityManager 实例
const abpUserManager = new AbpUserManager();
const abpProductManager = new AbpProductManager();
const springOrderManager = new SpringOrderManager();
const springItemManager = new SpringItemManager();
const departmentManager = new DepartmentManager();
const notificationManager = new LocalNotificationManager();
const tagManager = new LocalTagManager();

// 初始化本地数据
function initLocalData(): void {
    // 通知数据（只读）
    const notifications = [
        { id: 1, title: '系统维护通知', message: '系统将于今晚 22:00 进行维护', type: 'system', read: false, createdAt: '2026-07-03 09:00' },
        { id: 2, title: '新功能上线', message: '树形管理器已上线，支持懒加载', type: 'feature', read: false, createdAt: '2026-07-02 14:30' },
        { id: 3, title: '安全提醒', message: '请定期修改密码', type: 'security', read: true, createdAt: '2026-07-01 10:00' },
        { id: 4, title: '版本更新', message: 'v2.0 已发布，新增 5 种 Manager 类型', type: 'feature', read: true, createdAt: '2026-06-30 16:00' },
    ];
    notificationManager.sourceData.clear();
    notifications.forEach(n => notificationManager.sourceData.set(n.id, n));
    notificationManager.items = [...notifications];

    // 标签数据（CRUD）
    const tags = [
        { id: 1, name: '重要', color: '#f44336', count: 5 },
        { id: 2, name: '待办', color: '#FF9800', count: 12 },
        { id: 3, name: '已完成', color: '#4CAF50', count: 28 },
        { id: 4, name: '进行中', color: '#2196F3', count: 8 },
    ];
    tagManager.sourceData.clear();
    tags.forEach(t => tagManager.sourceData.set(t.id, t));
    tagManager.items = [...tags];
}

export function showDashboard(): void {
    initLocalData();

    render('app', `
        <div style="max-width: 1400px; margin: 20px auto; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h1>OrbitJS 全栈示例</h1>
                <div>
                    <span id="auth-status"></span>
                    ${button('登出', 'window.__logout()', '#f44336')}
                </div>
            </div>

            <!-- 远程 Manager 区域 -->
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 4px;">远程 EntityManager</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div>
                    ${card('RemoteCrudEntityManager - ABP 用户', '<div id="abp-users">' + loading() + '</div>', '#4CAF50')}
                    ${card('RemoteCrudEntityManager - ABP 产品', '<div id="abp-products">' + loading() + '</div>', '#4CAF50')}
                </div>
                <div>
                    ${card('RemoteCrudEntityManager - Spring 订单', '<div id="spring-orders">' + loading() + '</div>', '#2196F3')}
                    ${card('分页导航', `
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                            ${button('上一页', 'window.__prevPage()', '#2196F3')}
                            <span id="page-info" style="padding: 0 8px; font-size: 14px;">-</span>
                            ${button('下一页', 'window.__nextPage()', '#2196F3')}
                            ${button('跳转第1页', 'window.__jumpPage(1)', '#2196F3')}
                            ${button('每页5条', 'window.__changePageSize(5)', '#2196F3')}
                            ${button('每页10条', 'window.__changePageSize(10)', '#2196F3')}
                            ${button('每页20条', 'window.__changePageSize(20)', '#2196F3')}
                            ${button('每页50条', 'window.__changePageSize(50)', '#2196F3')}
                        </div>
                    `, '#2196F3')}
                    ${card('RemoteReadonlyEntityManager - Spring 商品（只读）', '<div id="spring-items">' + loading() + '</div>', '#2196F3')}
                </div>
            </div>

            <!-- 树形 Manager 区域 -->
            <h2 style="color: #333; border-bottom: 2px solid #9C27B0; padding-bottom: 4px;">RemoteTreeEntityManager - 部门树</h2>
            <div style="margin-bottom: 24px;">
                ${card('部门树形结构（懒加载 + 展开/折叠）', '<div id="department-tree">' + loading() + '</div>', '#9C27B0')}
            </div>

            <!-- 本地 Manager 区域 -->
            <h2 style="color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 4px;">本地 EntityManager</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div>
                    ${card('LocalReadonlyEntityManager - 通知（只读）', '<div id="local-notifications"></div>', '#FF9800')}
                </div>
                <div>
                    ${card('LocalCrudEntityManager - 标签（CRUD）', '<div id="local-tags"></div>', '#FF9800')}
                </div>
            </div>

            <!-- 操作测试区域 -->
            <h2 style="color: #333; border-bottom: 2px solid #607D8B; padding-bottom: 4px;">操作测试</h2>
            <div style="margin-bottom: 24px;">
                ${card('筛选/排序（ABP 用户）', `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                        ${button('筛选: admin', "window.__filterUsers('admin')", '#4CAF50')}
                        ${button('筛选: 空', "window.__filterUsers('')", '#4CAF50')}
                        ${button('排序: ID升序', "window.__sortUsers('id', 'asc')", '#4CAF50')}
                        ${button('排序: ID降序', "window.__sortUsers('id', 'desc')", '#4CAF50')}
                        ${button('重置', 'window.__resetUsers()', '#4CAF50')}
                    </div>
                `, '#4CAF50')}
                ${card('其他操作', `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${button('创建 ABP 用户（验证错误）', 'window.__createAbpUser()', '#FF9800')}
                        ${button('添加本地标签', 'window.__addLocalTag()', '#FF9800')}
                        ${button('删除本地标签', 'window.__removeLocalTag()', '#f44336')}
                        ${button('加载部门树', 'window.__loadDepartments()', '#9C27B0')}
                    </div>
                    <div id="action-result" style="margin-top: 8px;"></div>
                `, '#607D8B')}
            </div>

            <!-- Manager 类型说明 -->
            <h2 style="color: #333; border-bottom: 2px solid #795548; padding-bottom: 4px;">Manager 类型对照</h2>
            <div style="margin-bottom: 24px;">
                ${card('5 种 EntityManager 类型', `
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">类型</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">能力</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">示例</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><code>LocalReadonlyEntityManager</code></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">list / get</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">本地通知</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><code>LocalCrudEntityManager</code></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">list / get / create / update / delete</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">本地标签</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><code>RemoteReadonlyEntityManager</code></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">list / getAll / get / query / filter / sort</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">Spring 商品</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><code>RemoteCrudEntityManager</code></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">上述 + create / update / delete / toggle</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">ABP 用户/产品、Spring 订单</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><code>RemoteTreeEntityManager</code></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">上述 + expand / collapse / move / refresh</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">部门树</td>
                        </tr>
                    </table>
                `, '#795548')}
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

    // 加载远程数据
    fetchAbpUsers();
    fetchAbpProducts();
    fetchSpringOrders();
    fetchSpringItems();
    loadDepartments();

    // 渲染本地数据
    renderNotifications();
    renderTags();
}

// ===== ABP 域数据（RemoteCrudEntityManager）=====

async function fetchAbpUsers(): Promise<void> {
    const container = document.getElementById('abp-users');
    if (!container) return;

    try {
        const items = await abpUserManager.list();
        container.innerHTML = table(
            ['ID', '用户名', '姓名', '邮箱', '状态'],
            items.map((u: any) => [
                u.id,
                u.userName,
                u.name,
                u.email,
                u.isActive ? badge('活跃', '#4CAF50') : badge('禁用', '#999'),
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${abpUserManager.total} 条 | 类型: RemoteCrudEntityManager</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

async function fetchAbpProducts(): Promise<void> {
    const container = document.getElementById('abp-products');
    if (!container) return;

    try {
        const items = await abpProductManager.list();
        container.innerHTML = table(
            ['ID', '名称', '价格', '库存', '分类'],
            items.map((p: any) => [
                p.id,
                p.name,
                '¥' + p.price,
                p.stock,
                p.category,
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${abpProductManager.total} 条 | 类型: RemoteCrudEntityManager</p>`;
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
        container.innerHTML = table(
            ['ID', '订单号', '客户', '金额', '状态'],
            items.map((o: any) => [
                o.id,
                o.orderNo,
                o.customer,
                '¥' + o.amount,
                badge(o.status, statusColor(o.status)),
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${springOrderManager.total} 条，第 ${springOrderManager.page}/${springOrderManager.pages} 页 | 类型: RemoteCrudEntityManager</p>`;

        // 更新分页信息
        updatePageInfo();
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

function updatePageInfo(): void {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `第 ${springOrderManager.page} / ${springOrderManager.pages} 页（每页 ${springOrderManager.pageSize} 条，共 ${springOrderManager.total} 条）`;
    }
}

async function fetchSpringItems(): Promise<void> {
    const container = document.getElementById('spring-items');
    if (!container) return;

    try {
        const items = await springItemManager.list();
        container.innerHTML = table(
            ['ID', '名称', '价格', '库存', '分类'],
            items.map((i: any) => [
                i.id,
                i.name,
                '¥' + i.price,
                i.stock,
                i.category,
            ])
        ) + `<p style="color: #666; font-size: 12px;">共 ${springItemManager.total} 条 | 类型: RemoteReadonlyEntityManager（无 create/update/delete）</p>`;
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

// ===== 部门树（RemoteTreeEntityManager）=====

async function loadDepartments(): Promise<void> {
    const container = document.getElementById('department-tree');
    if (!container) return;

    try {
        const items = await departmentManager.list();
        departmentManager.ingest(items);

        renderDepartmentTree(container);
    } catch (e: any) {
        container.innerHTML = error(e.message);
    }
}

function renderDepartmentTree(container: HTMLElement): void {
    const flatItems = departmentManager._generateFlatItems();
    if (flatItems.length === 0) {
        container.innerHTML = '<p style="color: #999;">暂无数据</p>';
        return;
    }

    let html = '<div style="font-size: 13px;">';
    flatItems.forEach((item: any) => {
        const indent = (item._depth || 0) * 20;
        const expandIcon = item.leaf ? '  ' : (item.expanded ? '▼' : '▶');
        const clickHandler = item.leaf ? '' : `window.__toggleDepartment(${item.id})`;
        html += `<div style="padding: 4px 8px; padding-left: ${indent + 8}px; cursor: ${item.leaf ? 'default' : 'pointer'}; border-bottom: 1px solid #f0f0f0;" ${clickHandler ? `onclick="${clickHandler}"` : ''}>
            <span style="margin-right: 6px;">${expandIcon}</span>
            <strong>${item.name}</strong>
            <span style="color: #999; margin-left: 8px;">${item.employeeCount || 0} 人</span>
            ${item.leaf ? badge('叶', '#ccc') : badge('支', '#9C27B0')}
        </div>`;
    });
    html += '</div>';
    html += `<p style="color: #666; font-size: 12px; margin-top: 8px;">共 ${flatItems.length} 个可见节点 | 类型: RemoteTreeEntityManager（懒加载 + 展开/折叠）</p>`;

    container.innerHTML = html;
}

// ===== 本地数据 =====

function renderNotifications(): void {
    const container = document.getElementById('local-notifications');
    if (!container) return;

    const items = notificationManager.items;
    container.innerHTML = table(
        ['ID', '标题', '类型', '已读', '时间'],
        items.map((n: any) => [
            n.id,
            n.title,
            badge(n.type, n.type === 'system' ? '#f44336' : n.type === 'feature' ? '#4CAF50' : '#FF9800'),
            n.read ? badge('已读', '#999') : badge('未读', '#2196F3'),
            n.createdAt,
        ])
    ) + `<p style="color: #666; font-size: 12px;">共 ${items.length} 条 | 类型: LocalReadonlyEntityManager（只读，无 create/update/delete）</p>`;
}

function renderTags(): void {
    const container = document.getElementById('local-tags');
    if (!container) return;

    const items = tagManager.items;
    container.innerHTML = table(
        ['ID', '名称', '颜色', '使用次数'],
        items.map((t: any) => [
            t.id,
            `<span style="display: inline-block; width: 12px; height: 12px; background: ${t.color}; border-radius: 2px; margin-right: 4px; vertical-align: middle;"></span>${t.name}`,
            t.color,
            t.count,
        ])
    ) + `<p style="color: #666; font-size: 12px;">共 ${items.length} 条 | 类型: LocalCrudEntityManager（支持 create/update/delete）</p>`;
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

function showActionResult(message: string, isError: boolean = false): void {
    const result = document.getElementById('action-result');
    if (!result) return;
    const bg = isError ? '#fff3e0' : '#e8f5e9';
    result.innerHTML = `<div style="padding: 8px; background: ${bg}; border-radius: 4px; margin-top: 8px;">${message}</div>`;
}

// ===== 暴露到 window =====

(window as any).__fetchAbpUsers = () => fetchAbpUsers();
(window as any).__fetchSpringOrders = () => fetchSpringOrders();

// ===== 分页导航（Spring 订单）=====

(window as any).__prevPage = async () => {
    try {
        await springOrderManager.prev();
        fetchSpringOrders();
    } catch (e: any) {
        showActionResult(`上一页失败: ${e.message}`, true);
    }
};

(window as any).__nextPage = async () => {
    try {
        await springOrderManager.next();
        fetchSpringOrders();
    } catch (e: any) {
        showActionResult(`下一页失败: ${e.message}`, true);
    }
};

(window as any).__jumpPage = async (page: number) => {
    try {
        await springOrderManager.jump(page);
        fetchSpringOrders();
    } catch (e: any) {
        showActionResult(`跳转失败: ${e.message}`, true);
    }
};

(window as any).__changePageSize = async (size: number) => {
    try {
        await springOrderManager.changeSize(size);
        fetchSpringOrders();
    } catch (e: any) {
        showActionResult(`修改每页条数失败: ${e.message}`, true);
    }
};

// ===== 筛选/排序（ABP 用户）=====

(window as any).__filterUsers = async (text: string) => {
    try {
        await abpUserManager.filter(text);
        fetchAbpUsers();
        showActionResult(`筛选: "${text || '(空)'}"`);
    } catch (e: any) {
        showActionResult(`筛选失败: ${e.message}`, true);
    }
};

(window as any).__sortUsers = async (prop: string, order: 'asc' | 'desc') => {
    try {
        await abpUserManager.sort(prop, order);
        fetchAbpUsers();
        showActionResult(`排序: ${prop} ${order}`);
    } catch (e: any) {
        showActionResult(`排序失败: ${e.message}`, true);
    }
};

(window as any).__resetUsers = async () => {
    try {
        await abpUserManager.reset();
        fetchAbpUsers();
        showActionResult('已重置查询');
    } catch (e: any) {
        showActionResult(`重置失败: ${e.message}`, true);
    }
};

// ===== 其他操作 =====

(window as any).__createAbpUser = async () => {
    try {
        const item = await abpUserManager.create({});
        showActionResult(`创建成功: ${item.userName}`);
        fetchAbpUsers();
    } catch (e: any) {
        showActionResult(`错误: ${e.message || '创建失败'}`, true);
    }
};

(window as any).__addLocalTag = () => {
    const colors = ['#f44336', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#795548'];
    const names = ['紧急', '优化', '文档', '测试', '设计', '部署'];
    const idx = tagManager.items.length % names.length;

    const newTag = {
        id: tagManager.items.length + 1,
        name: names[idx],
        color: colors[idx],
        count: 0,
    };

    tagManager.sourceData.set(newTag.id, newTag);
    tagManager.items = [...tagManager.items, newTag];

    renderTags();
    showActionResult(`添加标签: ${newTag.name}`);
};

(window as any).__removeLocalTag = () => {
    if (tagManager.items.length === 0) {
        showActionResult('没有可删除的标签', true);
        return;
    }

    const removed = tagManager.items[tagManager.items.length - 1] as any;
    tagManager.sourceData.delete(removed.id!);
    tagManager.items = tagManager.items.slice(0, -1);

    renderTags();
    showActionResult(`删除标签: ${removed.name}`);
};

(window as any).__loadDepartments = () => loadDepartments();

(window as any).__toggleDepartment = async (id: number) => {
    const node = departmentManager.nodes.get(id);
    if (!node || node.leaf) return;

    if (node.expanded) {
        departmentManager.collapse(id);
    } else {
        await departmentManager.expand(id);
    }

    const container = document.getElementById('department-tree');
    if (container) renderDepartmentTree(container);
};

(window as any).__logout = async () => {
    await oauth2.logout();
    const { showLoginPage } = await import('./login');
    showLoginPage();
};
