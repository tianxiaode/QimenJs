/**
 * 本地通知页 - LocalReadonlyEntityManager
 */
import { LocalNotificationManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new LocalNotificationManager();

function initData(): void {
    const notifications = [
        { id: 1, title: '系统维护通知', message: '系统将于今晚 22:00 进行维护', type: 'system', read: false, createdAt: '2026-07-03 09:00' },
        { id: 2, title: '新功能上线', message: '树形管理器已上线，支持懒加载', type: 'feature', read: false, createdAt: '2026-07-02 14:30' },
        { id: 3, title: '安全提醒', message: '请定期修改密码', type: 'security', read: true, createdAt: '2026-07-01 10:00' },
        { id: 4, title: '版本更新', message: 'v2.0 已发布，新增 5 种 Manager 类型', type: 'feature', read: true, createdAt: '2026-06-30 16:00' },
    ];
    manager.sourceData.clear();
    notifications.forEach(n => manager.sourceData.set(n.id, n));
    manager.items = [...notifications];
}

export function renderNotifications(): void {
    initData();

    const typeBadge: Record<string, string> = { system: 'badge-danger', feature: 'badge-success', security: 'badge-warning' };

    renderPageContent(`
        <div class="page-header">
            <h2>本地通知</h2>
            <p>LocalReadonlyEntityManager — 纯前端数据，无后端依赖</p>
        </div>
        <div class="section">
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>标题</th><th>类型</th><th>状态</th><th>时间</th></tr></thead>
                    <tbody>${manager.items.map((n: any) => `
                        <tr>
                            <td>${n.id}</td>
                            <td>${n.title}</td>
                            <td><span class="badge ${typeBadge[n.type] || 'badge-muted'}">${n.type}</span></td>
                            <td>${n.read ? '<span class="badge badge-muted">已读</span>' : '<span class="badge badge-info">未读</span>'}</td>
                            <td class="text-muted">${n.createdAt}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
                <div class="pagination" style="margin-top:12px;">
                    <span class="text-muted text-sm">共 ${manager.items.length} 条 · LocalReadonlyEntityManager（只读）</span>
                </div>
            </div>
        </div>
    `);
}
