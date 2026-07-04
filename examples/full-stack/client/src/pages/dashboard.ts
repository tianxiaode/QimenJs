/**
 * 仪表盘页 - 统计概览 + 快捷入口
 */
import { AbpUserManager, AbpProductManager, SpringOrderManager, SpringItemManager, LocalNotificationManager, LocalTagManager, DepartmentManager } from '../managers';
import { oauth2 } from '../config';
import { renderPageContent } from '../layout';

const abpUserManager = new AbpUserManager();
const abpProductManager = new AbpProductManager();
const springOrderManager = new SpringOrderManager();
const springItemManager = new SpringItemManager();
const departmentManager = new DepartmentManager();
const notificationManager = new LocalNotificationManager();
const tagManager = new LocalTagManager();

export function renderDashboard(): void {
    initLocalData();

    renderPageContent(`
        <div class="page-header">
            <h2>仪表盘</h2>
            <p>OrbitJS 全栈示例 — 5 种 EntityManager + OAuth2 + 多域数据</p>
        </div>

        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-label">ABP 用户</div>
                <div class="stat-value" id="stat-users">—</div>
                <div class="stat-change up">RemoteCrudEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">ABP 产品</div>
                <div class="stat-value" id="stat-products">—</div>
                <div class="stat-change up">RemoteCrudEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Spring 订单</div>
                <div class="stat-value" id="stat-orders">—</div>
                <div class="stat-change up">RemoteCrudEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Spring 商品</div>
                <div class="stat-value" id="stat-items">—</div>
                <div class="stat-change up">RemoteReadonlyEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">部门节点</div>
                <div class="stat-value" id="stat-departments">—</div>
                <div class="stat-change up">RemoteTreeEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">本地通知</div>
                <div class="stat-value" id="stat-notifications">${notificationManager.items.length}</div>
                <div class="stat-change up">LocalReadonlyEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">本地标签</div>
                <div class="stat-value" id="stat-tags">${tagManager.items.length}</div>
                <div class="stat-change up">LocalCrudEntityManager</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">认证状态</div>
                <div class="stat-value" style="font-size:16px;">${oauth2.isAuthenticated() ? '✓ 已认证' : '✗ 未认证'}</div>
                <div class="stat-change ${oauth2.isAuthenticated() ? 'up' : 'down'}">OAuth2 ${oauth2.isAuthenticated() ? 'Token 有效' : '未登录'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Manager 类型对照</div>
            <div class="card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>类型</th>
                            <th>能力</th>
                            <th>示例</th>
                            <th>域</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>LocalReadonlyEntityManager</code></td>
                            <td>list / get</td>
                            <td>本地通知</td>
                            <td><span class="badge badge-warning">local</span></td>
                        </tr>
                        <tr>
                            <td><code>LocalCrudEntityManager</code></td>
                            <td>list / get / create / update / delete</td>
                            <td>本地标签</td>
                            <td><span class="badge badge-warning">local</span></td>
                        </tr>
                        <tr>
                            <td><code>RemoteReadonlyEntityManager</code></td>
                            <td>list / getAll / get / query / filter / sort</td>
                            <td>Spring 商品</td>
                            <td><span class="badge badge-info">spring</span></td>
                        </tr>
                        <tr>
                            <td><code>RemoteCrudEntityManager</code></td>
                            <td>上述 + create / update / delete / toggle</td>
                            <td>ABP 用户/产品、Spring 订单</td>
                            <td><span class="badge badge-success">abp</span> <span class="badge badge-info">spring</span></td>
                        </tr>
                        <tr>
                            <td><code>RemoteTreeEntityManager</code></td>
                            <td>上述 + expand / collapse / move / refresh</td>
                            <td>部门树</td>
                            <td><span class="badge badge-success">abp</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">模块覆盖率</div>
            <div class="card">
                <div class="stat-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div class="stat-card">
                        <div class="stat-label">已覆盖模块</div>
                        <div class="stat-value" style="color:#4CAF50;">26 / 26</div>
                        <div class="stat-change up">100% 覆盖率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">演示页面</div>
                        <div class="stat-value" style="color:#6366F1;">31</div>
                        <div class="stat-change up">6 个导航分组</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">快速跳转</div>
            <div class="grid-3">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>核心基础</div>
                    <div class="text-sm" style="line-height:2;">
                        <a href="#" onclick="window.__navigate('error');return false;" style="color:#6366F1;">错误处理</a> ·
                        <a href="#" onclick="window.__navigate('logger');return false;" style="color:#6366F1;">日志系统</a> ·
                        <a href="#" onclick="window.__navigate('utils');return false;" style="color:#6366F1;">工具函数</a> ·
                        <a href="#" onclick="window.__navigate('async');return false;" style="color:#6366F1;">异步工具</a> ·
                        <a href="#" onclick="window.__navigate('runtime');return false;" style="color:#6366F1;">运行时</a> ·
                        <a href="#" onclick="window.__navigate('crypto');return false;" style="color:#6366F1;">加密</a> ·
                        <a href="#" onclick="window.__navigate('types');return false;" style="color:#6366F1;">类型</a> ·
                        <a href="#" onclick="window.__navigate('i18n');return false;" style="color:#6366F1;">国际化</a>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>基础设施</div>
                    <div class="text-sm" style="line-height:2;">
                        <a href="#" onclick="window.__navigate('registry');return false;" style="color:#A855F7;">注册器</a> ·
                        <a href="#" onclick="window.__navigate('cache');return false;" style="color:#A855F7;">缓存</a> ·
                        <a href="#" onclick="window.__navigate('events');return false;" style="color:#A855F7;">事件</a> ·
                        <a href="#" onclick="window.__navigate('task');return false;" style="color:#A855F7;">任务</a> ·
                        <a href="#" onclick="window.__navigate('composable');return false;" style="color:#A855F7;">组合</a> ·
                        <a href="#" onclick="window.__navigate('context');return false;" style="color:#A855F7;">上下文</a>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>功能工具</div>
                    <div class="text-sm" style="line-height:2;">
                        <a href="#" onclick="window.__navigate('schema');return false;" style="color:#4CAF50;">Schema</a> ·
                        <a href="#" onclick="window.__navigate('validation');return false;" style="color:#4CAF50;">验证</a> ·
                        <a href="#" onclick="window.__navigate('pipeline');return false;" style="color:#4CAF50;">管道</a> ·
                        <a href="#" onclick="window.__navigate('mime');return false;" style="color:#4CAF50;">MIME</a> ·
                        <a href="#" onclick="window.__navigate('pattern');return false;" style="color:#4CAF50;">模式</a> ·
                        <a href="#" onclick="window.__navigate('event-dom');return false;" style="color:#4CAF50;">DOM事件</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">OrbitJS 模块一览</div>
            <div class="grid-3">
                <div class="card"><div class="card-title"><span class="dot" style="background:#6366F1;"></span>核心层</div>
                    <div class="text-sm text-muted" style="line-height:1.8;">
                        @qimenjs/error · @qimenjs/logger · @qimenjs/utils<br>
                        @qimenjs/async · @qimenjs/runtime · @qimenjs/crypto<br>
                        @qimenjs/types · @qimenjs/i18n
                    </div>
                </div>
                <div class="card"><div class="card-title"><span class="dot" style="background:#A855F7;"></span>基础设施层</div>
                    <div class="text-sm text-muted" style="line-height:1.8;">
                        @qimenjs/registry · @qimenjs/cache · @qimenjs/events<br>
                        @qimenjs/task · @qimenjs/composable · @qimenjs/context<br>
                        @qimenjs/schema · @qimenjs/validation · @qimenjs/pipeline
                    </div>
                </div>
                <div class="card"><div class="card-title"><span class="dot" style="background:#4CAF50;"></span>高级功能层</div>
                    <div class="text-sm text-muted" style="line-height:1.8;">
                        @qimenjs/http · @qimenjs/oauth2 · @qimenjs/entity<br>
                        @qimenjs/data-processor · @qimenjs/data-processor-abp<br>
                        @qimenjs/data-processor-spring · @qimenjs/system-abilities
                    </div>
                </div>
            </div>
        </div>
    `);

    // 异步加载统计数据
    loadStats();
}

function initLocalData(): void {
    const notifications = [
        { id: 1, title: '系统维护通知', message: '系统将于今晚 22:00 进行维护', type: 'system', read: false, createdAt: '2026-07-03 09:00' },
        { id: 2, title: '新功能上线', message: '树形管理器已上线，支持懒加载', type: 'feature', read: false, createdAt: '2026-07-02 14:30' },
        { id: 3, title: '安全提醒', message: '请定期修改密码', type: 'security', read: true, createdAt: '2026-07-01 10:00' },
        { id: 4, title: '版本更新', message: 'v2.0 已发布，新增 5 种 Manager 类型', type: 'feature', read: true, createdAt: '2026-06-30 16:00' },
    ];
    notificationManager.sourceData.clear();
    notifications.forEach(n => notificationManager.sourceData.set(n.id, n));
    notificationManager.items = [...notifications];

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

async function loadStats(): Promise<void> {
    try {
        const users = await abpUserManager.list();
        const el = document.getElementById('stat-users');
        if (el) el.textContent = String(abpUserManager.total ?? users.length);
    } catch { /* ignore */ }

    try {
        const products = await abpProductManager.list();
        const el = document.getElementById('stat-products');
        if (el) el.textContent = String(abpProductManager.total ?? products.length);
    } catch { /* ignore */ }

    try {
        const orders = await springOrderManager.list();
        const el = document.getElementById('stat-orders');
        if (el) el.textContent = String(springOrderManager.total ?? orders.length);
    } catch { /* ignore */ }

    try {
        const items = await springItemManager.list();
        const el = document.getElementById('stat-items');
        if (el) el.textContent = String(springItemManager.total ?? items.length);
    } catch { /* ignore */ }

    try {
        const depts = await departmentManager.list();
        departmentManager.ingest(depts);
        const el = document.getElementById('stat-departments');
        if (el) el.textContent = String(depts.length);
    } catch { /* ignore */ }
}
