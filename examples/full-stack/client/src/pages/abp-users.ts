/**
 * ABP 用户页 - RemoteCrudEntityManager
 */
import { AbpUserManager } from '../managers';
import { renderPageContent, setActivePage } from '../layout';

const manager = new AbpUserManager();

export async function renderAbpUsers(): Promise<void> {
    renderPageContent(`
        <div class="page-header">
            <h2>ABP 用户</h2>
            <p>RemoteCrudEntityManager — 远程 CRUD + ABP 分页格式</p>
        </div>
        <div class="section">
            <div class="flex items-center justify-between mb-3">
                <div class="flex gap-2">
                    <input id="user-filter" class="input" style="width:200px;" placeholder="搜索用户名/姓名/邮箱..." onkeydown="if(event.key==='Enter')window.__filterUsers(this.value)">
                    <button class="btn btn-ghost btn-sm" onclick="window.__filterUsers(document.getElementById('user-filter').value)">搜索</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__resetUsers()">重置</button>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="window.__sortUsers('id','asc')">ID ↑</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__sortUsers('id','desc')">ID ↓</button>
                </div>
            </div>
            <div class="card">
                <div id="user-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `);

    await loadUsers();
}

async function loadUsers(): Promise<void> {
    const container = document.getElementById('user-table');
    if (!container) return;

    try {
        const items = await manager.list();
        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>ID</th><th>用户名</th><th>姓名</th><th>邮箱</th><th>状态</th></tr></thead>
                <tbody>${items.map((u: any) => `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.userName}</td>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.isActive ? '<span class="badge badge-success">活跃</span>' : '<span class="badge badge-muted">禁用</span>'}</td>
                    </tr>
                `).join('')}</tbody>
            </table>
            <div class="pagination" style="margin-top:12px;">
                <span class="text-muted text-sm">共 ${manager.total} 条 · RemoteCrudEntityManager · ABP PagedResultDto</span>
            </div>
        `;
    } catch (e: any) {
        container.innerHTML = `<div class="error-msg">${e.message}</div>`;
    }
}

(window as any).__filterUsers = async (text: string) => {
    await manager.filter(text);
    await loadUsers();
};

(window as any).__sortUsers = async (prop: string, order: 'asc' | 'desc') => {
    await manager.sort(prop, order);
    await loadUsers();
};

(window as any).__resetUsers = async () => {
    await manager.reset();
    await loadUsers();
};
