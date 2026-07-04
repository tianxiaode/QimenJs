/**
 * Spring 订单页 - RemoteCrudEntityManager + 分页导航
 */
import { SpringOrderManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new SpringOrderManager();

export async function renderSpringOrders(): Promise<void> {
    renderPageContent(`
        <div class="page-header">
            <h2>Spring 订单</h2>
            <p>RemoteCrudEntityManager — Spring Page&lt;T&gt; 分页格式 + 分页导航</p>
        </div>
        <div class="section">
            <div class="card">
                <div id="order-table"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
            <div class="pagination" id="order-pagination"></div>
        </div>
    `);

    await loadOrders();
}

async function loadOrders(): Promise<void> {
    const container = document.getElementById('order-table');
    const pagination = document.getElementById('order-pagination');
    if (!container) return;

    try {
        const items = await manager.list();
        const statusBadge: Record<string, string> = {
            COMPLETED: 'badge-success', PENDING: 'badge-warning',
            SHIPPED: 'badge-info', CANCELLED: 'badge-danger',
        };

        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>ID</th><th>订单号</th><th>客户</th><th>金额</th><th>状态</th></tr></thead>
                <tbody>${items.map((o: any) => `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.orderNo}</td>
                        <td>${o.customer}</td>
                        <td>¥${o.amount}</td>
                        <td><span class="badge ${statusBadge[o.status] || 'badge-muted'}">${o.status}</span></td>
                    </tr>
                `).join('')}</tbody>
            </table>
        `;

        if (pagination) {
            pagination.innerHTML = `
                <button class="btn btn-ghost btn-sm" onclick="window.__prevPage()">上一页</button>
                <span class="page-info">第 ${manager.page} / ${manager.pages} 页（每页 ${manager.pageSize} 条，共 ${manager.total} 条）</span>
                <button class="btn btn-ghost btn-sm" onclick="window.__nextPage()">下一页</button>
                <span style="margin-left:12px;" class="text-muted text-xs">每页条数：</span>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(5)">5</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(10)">10</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(20)">20</button>
                <button class="btn btn-ghost btn-sm" onclick="window.__changeSize(50)">50</button>
            `;
        }
    } catch (e: any) {
        container.innerHTML = `<div class="error-msg">${e.message}</div>`;
    }
}

(window as any).__prevPage = async () => { await manager.prev(); await loadOrders(); };
(window as any).__nextPage = async () => { await manager.next(); await loadOrders(); };
(window as any).__changeSize = async (size: number) => { await manager.changeSize(size); await loadOrders(); };
