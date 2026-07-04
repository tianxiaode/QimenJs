/**
 * ABP 产品页 - RemoteCrudEntityManager
 */
import { AbpProductManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new AbpProductManager();

export async function renderAbpProducts(): Promise<void> {
    renderPageContent(`
        <div class="page-header">
            <h2>ABP 产品</h2>
            <p>RemoteCrudEntityManager — 远程 CRUD + ABP 分页格式</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="product-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `);

    await loadProducts();
}

async function loadProducts(): Promise<void> {
    const container = document.getElementById('product-table');
    if (!container) return;

    try {
        const items = await manager.list();
        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>ID</th><th>名称</th><th>价格</th><th>库存</th><th>分类</th></tr></thead>
                <tbody>${items.map((p: any) => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.name}</td>
                        <td>¥${p.price}</td>
                        <td>${p.stock}</td>
                        <td><span class="badge badge-info">${p.category}</span></td>
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
