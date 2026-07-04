/**
 * 数据处理器页 - @orbit-js/data-processor + data-processor-abp + data-processor-spring
 */
import { renderPageContent } from '../layout';

export function renderDataProcessor(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>数据处理器</h2>
            <p>@orbit-js/data-processor + data-processor-abp + data-processor-spring</p>
        </div>

        <div class="section">
            <div class="section-title">处理器架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    数据处理器采用管道模式，分为<strong>前道处理器</strong>（请求发送前转换请求参数）
                    和<strong>后道处理器</strong>（响应返回后转换响应数据）。ABP 和 Spring 后端有不同的分页格式，
                    通过各自的处理器实现透明适配。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">ABP 格式 (PagedResultDto)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>ABP 分页格式转换</div>
                <p class="text-sm text-muted mb-3">ABP 使用 skipCount/maxResultCount 分页，返回 { totalCount, items }</p>
                <div class="form-group">
                    <label>ABP 响应数据 (JSON)</label>
                    <textarea id="dp-abp-input" class="input" rows="6" style="font-family:monospace;font-size:12px;">{
  "totalCount": 50,
  "items": [
    {"id": 1, "name": "用户A"},
    {"id": 2, "name": "用户B"}
  ]
}</textarea>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__processAbp()">处理 ABP 数据</button>
                <div id="dp-abp-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Spring 格式 (Page&lt;T&gt;)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>Spring 分页格式转换</div>
                <p class="text-sm text-muted mb-3">Spring 使用 page/size 分页，返回 { content, totalElements, totalPages, ... }</p>
                <div class="form-group">
                    <label>Spring 响应数据 (JSON)</label>
                    <textarea id="dp-spring-input" class="input" rows="8" style="font-family:monospace;font-size:12px;">{
  "content": [
    {"id": 1, "name": "订单A"},
    {"id": 2, "name": "订单B"}
  ],
  "totalElements": 30,
  "totalPages": 3,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}</textarea>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__processSpring()">处理 Spring 数据</button>
                <div id="dp-spring-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">格式对比</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>特性</th><th>ABP PagedResultDto</th><th>Spring Page&lt;T&gt;</th></tr></thead>
                    <tbody>
                        <tr><td>分页参数</td><td>skipCount + maxResultCount</td><td>page + size</td></tr>
                        <tr><td>数据字段</td><td>items</td><td>content</td></tr>
                        <tr><td>总数</td><td>totalCount</td><td>totalElements</td></tr>
                        <tr><td>总页数</td><td>需计算</td><td>totalPages</td></tr>
                        <tr><td>当前页</td><td>需计算</td><td>number</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

(window as any).__processAbp = () => {
    const el = document.getElementById('dp-abp-result');
    if (!el) return;
    try {
        const input = (document.getElementById('dp-abp-input') as HTMLTextAreaElement).value;
        const data = JSON.parse(input);
        // 模拟 ABP 后道处理器转换
        const result = {
            items: data.items || [],
            total: data.totalCount || 0,
            page: 1,
            pageSize: (data.items || []).length,
        };
        el.innerHTML = `
            <div><span class="badge badge-success">处理完成</span></div>
            <pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(result, null, 2)}</pre>
        `;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">处理失败: ${err}</span>`;
    }
};

(window as any).__processSpring = () => {
    const el = document.getElementById('dp-spring-result');
    if (!el) return;
    try {
        const input = (document.getElementById('dp-spring-input') as HTMLTextAreaElement).value;
        const data = JSON.parse(input);
        // 模拟 Spring 后道处理器转换
        const result = {
            items: data.content || [],
            total: data.totalElements || 0,
            page: (data.number || 0) + 1,
            pageSize: data.size || 10,
            pages: data.totalPages || 0,
        };
        el.innerHTML = `
            <div><span class="badge badge-success">处理完成</span></div>
            <pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(result, null, 2)}</pre>
        `;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">处理失败: ${err}</span>`;
    }
};
