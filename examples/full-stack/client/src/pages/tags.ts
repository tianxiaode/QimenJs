/**
 * 本地标签页 - LocalCrudEntityManager
 */
import { LocalTagManager } from '../managers';
import { renderPageContent } from '../layout';

const manager = new LocalTagManager();

function initData(): void {
    const tags = [
        { id: 1, name: '重要', color: '#f44336', count: 5 },
        { id: 2, name: '待办', color: '#FF9800', count: 12 },
        { id: 3, name: '已完成', color: '#4CAF50', count: 28 },
        { id: 4, name: '进行中', color: '#2196F3', count: 8 },
    ];
    manager.sourceData.clear();
    tags.forEach(t => manager.sourceData.set(t.id, t));
    manager.items = [...tags];
}

export function renderTags(): void {
    initData();
    renderContent();
}

function renderContent(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>本地标签</h2>
            <p>LocalCrudEntityManager — 纯前端 CRUD，无后端依赖</p>
        </div>
        <div class="section">
            <div class="flex gap-2 mb-3">
                <button class="btn btn-primary btn-sm" onclick="window.__addTag()">添加标签</button>
                <button class="btn btn-danger btn-sm" onclick="window.__removeTag()">删除最后一个</button>
            </div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>名称</th><th>颜色</th><th>使用次数</th></tr></thead>
                    <tbody>${manager.items.map((t: any) => `
                        <tr>
                            <td>${t.id}</td>
                            <td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${t.color};margin-right:6px;vertical-align:middle;"></span>${t.name}</td>
                            <td class="text-muted">${t.color}</td>
                            <td>${t.count}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
                <div class="pagination" style="margin-top:12px;">
                    <span class="text-muted text-sm">共 ${manager.items.length} 条 · LocalCrudEntityManager（支持 create/update/delete）</span>
                </div>
            </div>
        </div>
    `);
}

(window as any).__addTag = () => {
    const colors = ['#f44336', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#795548'];
    const names = ['紧急', '优化', '文档', '测试', '设计', '部署'];
    const idx = manager.items.length % names.length;
    const newTag = { id: manager.items.length + 1, name: names[idx], color: colors[idx], count: 0 };
    manager.sourceData.set(newTag.id, newTag);
    manager.items = [...manager.items, newTag];
    renderContent();
};

(window as any).__removeTag = () => {
    if (manager.items.length === 0) return;
    const removed = manager.items[manager.items.length - 1] as any;
    manager.sourceData.delete(removed.id);
    manager.items = manager.items.slice(0, -1);
    renderContent();
};
