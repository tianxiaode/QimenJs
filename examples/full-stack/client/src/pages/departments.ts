/**
 * 部门树页 - RemoteTreeEntityManager
 */
import { DepartmentManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new DepartmentManager();

export async function renderDepartments(): Promise<void> {
    renderPageContent(`
        <div class="page-header">
            <h2>部门树</h2>
            <p>RemoteTreeEntityManager — 懒加载 + 展开/折叠 + 移动</p>
        </div>
        <div class="section">
            <div class="flex gap-2 mb-3">
                <button class="btn btn-ghost btn-sm" onclick="window.__loadDepartments()">刷新</button>
            </div>
            <div class="card">
                <div id="dept-tree"><div class="loading-skeleton" style="height:200px;"></div></div>
            </div>
        </div>
    `);

    await loadDepartments();
}

async function loadDepartments(): Promise<void> {
    const container = document.getElementById('dept-tree');
    if (!container) return;

    try {
        const items = await manager.list();
        manager.ingest(items);
        renderTree(container);
    } catch (e: any) {
        container.innerHTML = `<div class="error-msg">${e.message}</div>`;
    }
}

function renderTree(container: HTMLElement): void {
    const flatItems = manager._generateFlatItems();
    if (flatItems.length === 0) {
        container.innerHTML = '<div class="text-muted text-sm" style="padding:16px;">暂无数据</div>';
        return;
    }

    container.innerHTML = flatItems.map((item: any) => {
        const indent = (item._depth || 0) * 20;
        const icon = item.leaf ? '·' : (item.expanded ? '▾' : '▸');
        const click = item.leaf ? '' : `onclick="window.__toggleDept(${item.id})"`;
        return `
            <div class="tree-node" style="padding-left:${indent + 8}px;${item.leaf ? '' : 'cursor:pointer;'}" ${click}>
                <span class="tree-toggle">${icon}</span>
                <span>${item.name}</span>
                <span class="text-muted text-xs" style="margin-left:8px;">${item.employeeCount || 0} 人</span>
                ${item.leaf ? '<span class="badge badge-muted" style="margin-left:4px;">叶</span>' : '<span class="badge badge-purple" style="margin-left:4px;">支</span>'}
            </div>
        `;
    }).join('') + `<div class="text-muted text-xs" style="padding:8px;">共 ${flatItems.length} 个可见节点 · RemoteTreeEntityManager</div>`;
}

(window as any).__loadDepartments = () => loadDepartments();

(window as any).__toggleDept = async (id: number) => {
    const node = manager.nodes.get(id);
    if (!node || node.leaf) return;

    if (node.expanded) {
        manager.collapse(id);
    } else {
        await manager.expand(id);
    }

    const container = document.getElementById('dept-tree');
    if (container) renderTree(container);
};
