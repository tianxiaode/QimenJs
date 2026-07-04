/**
 * Schema 页 - @qimenjs/schema
 */
import { renderPageContent } from '../layout';
import { UserSchema, ProductSchema, OrderSchema, ItemSchema, NotificationSchema, TagSchema, DepartmentSchema } from '../domains';

const allSchemas = [UserSchema, ProductSchema, OrderSchema, ItemSchema, NotificationSchema, TagSchema, DepartmentSchema];

export function renderSchema(): void {

    renderPageContent(`
        <div class="page-header">
            <h2>Schema</h2>
            <p>@qimenjs/schema — SchemaRegistrar 实体结构定义与注册</p>
        </div>

        <div class="section">
            <div class="section-title">Schema 结构说明</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td><code>name</code></td><td>string</td><td>实体名称</td></tr>
                        <tr><td><code>domain</code></td><td>string</td><td>所属域</td></tr>
                        <tr><td><code>idField</code></td><td>string</td><td>主键字段名</td></tr>
                        <tr><td><code>fields</code></td><td>FieldDef[]</td><td>字段定义列表</td></tr>
                        <tr><td><code>searchFields</code></td><td>string[]</td><td>可搜索字段</td></tr>
                        <tr><td><code>isTree</code></td><td>boolean</td><td>是否树形结构</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">已注册 Schema 列表</div>
            <div class="card">
                <div class="grid-2">
                    ${allSchemas.map(s => `
                        <div class="card" style="padding:12px;cursor:pointer;" onclick="window.__showSchema('${s.name}')">
                            <div style="font-weight:bold;color:#6366F1;">${s.name}</div>
                            <div class="text-xs text-muted mt-1">域: ${s.domain} | 主键: ${s.idField} | 树形: ${s.isTree ? '是' : '否'}</div>
                            <div class="text-xs text-muted">搜索字段: ${(s.searchFields || []).join(', ') || '无'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Schema 详情</div>
            <div class="card">
                <p class="text-sm text-muted">点击上方 Schema 卡片查看详情</p>
                <div id="schema-detail" class="mt-3 text-sm"></div>
            </div>
        </div>
    `);
}

(window as any).__showSchema = (name: string) => {
    const el = document.getElementById('schema-detail');
    if (!el) return;
    const schema = allSchemas.find(s => s.name === name);
    if (!schema) {
        el.innerHTML = '<span class="badge badge-danger">未找到</span>';
        return;
    }
    el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(schema, null, 2)}</pre>`;
};
