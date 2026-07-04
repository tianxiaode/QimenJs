/**
 * Spring 商品页 - RemoteReadonlyEntityManager
 */
import { SpringItemManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new SpringItemManager();

export async function renderSpringItems(): Promise<void> {
    renderPageContent(`
        <div class="page-header">
            <h2>Spring 商品</h2>
            <p>RemoteReadonlyEntityManager — 只读列表 + Spring Page&lt;T&gt; 格式</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="item-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `);

    await loadItems();
}

async function loadItems(): Promise<void> {
    const container = document.getElementById('item-table');
    if (!container) return;

    try {
        const items = await manager.list();
        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>ID</th><th>名称</th><th>价格</th><th>库存</th><th>分类</th></tr></thead>
                <tbody>${items.map((i: any) => `
                    <tr>
                        <td>${i.id}</td>
                        <td>${i.name}</td>
                        <td>¥${i.price}</td>
                        <td>${i.stock}</td>
                        <td><span class="badge badge-info">${i.category}</span></td>
                    </tr>
                `).join('')}</tbody>
            </table>
            <div class="pagination" style="margin-top:12px;">
                <span class="text-muted text-sm">共 ${manager.total} 条 · RemoteReadonlyEntityManager（无 create/update/delete）</span>
            </div>
        `;
    } catch (e: any) {
        container.innerHTML = `<div class="error-msg">${e.message}</div>`;
    }
}
