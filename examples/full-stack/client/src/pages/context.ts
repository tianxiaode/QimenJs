/**
 * 上下文管理页 - @qimenjs/context
 */
import { RequestContextBuilder, createBaseContext, addStep, setError, setTerminate, isTerminated } from '@qimen-lab/context';
import { renderPageContent } from '../layout';

export function renderContext(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>上下文管理</h2>
            <p>@qimenjs/context — RequestContextBuilder + BaseContext 操作</p>
        </div>

        <div class="section">
            <div class="section-title">上下文架构</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>组件</th><th>职责</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">BaseContext</span></td><td>基础执行上下文，含 steps/metadata/error</td></tr>
                        <tr><td><span class="badge badge-purple">RequestContext</span></td><td>HTTP 请求上下文，含 domain/entityName/action/request/response</td></tr>
                        <tr><td><span class="badge badge-success">RequestContextBuilder</span></td><td>链式构建 RequestContext</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">RequestContextBuilder 链式构建</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>构建请求上下文</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Domain</label>
                        <input id="ctx-domain" class="input" value="abp" placeholder="域名">
                    </div>
                    <div class="form-group">
                        <label>EntityName</label>
                        <input id="ctx-entity" class="input" value="User" placeholder="实体名">
                    </div>
                    <div class="form-group">
                        <label>Action</label>
                        <select id="ctx-action" class="input">
                            <option value="list">list</option>
                            <option value="get">get</option>
                            <option value="create">create</option>
                            <option value="update">update</option>
                            <option value="delete">delete</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>URL</label>
                        <input id="ctx-url" class="input" value="/api/app/user" placeholder="请求 URL">
                    </div>
                    <div class="form-group">
                        <label>Method</label>
                        <select id="ctx-method" class="input">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Query Params (JSON)</label>
                        <input id="ctx-params" class="input" value='{"page":1,"size":10}' placeholder="JSON 参数">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm mt-3" onclick="window.__buildRequestContext()">构建上下文</button>
                <div id="ctx-request-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">BaseContext 操作</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>基础上下文操作演示</div>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-primary btn-sm" onclick="window.__createBaseCtx()">创建基础上下文</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__addStepCtx()">addStep()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__setErrorCtx()">setError()</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__setTerminateCtx()">setTerminate()</button>
                </div>
                <div id="ctx-base-result" class="text-sm"></div>
            </div>
        </div>
    `);
}

(window as any).__buildRequestContext = () => {
    const el = document.getElementById('ctx-request-result');
    if (!el) return;
    try {
        const domain = (document.getElementById('ctx-domain') as HTMLInputElement).value;
        const entityName = (document.getElementById('ctx-entity') as HTMLInputElement).value;
        const action = (document.getElementById('ctx-action') as HTMLSelectElement).value;
        const url = (document.getElementById('ctx-url') as HTMLInputElement).value;
        const method = (document.getElementById('ctx-method') as HTMLSelectElement).value;
        const paramsStr = (document.getElementById('ctx-params') as HTMLInputElement).value;

        let queryParams: any = {};
        try { queryParams = JSON.parse(paramsStr); } catch {}

        const ctx = RequestContextBuilder.create()
            .withDomain(domain)
            .withEntityName(entityName)
            .withAction(action)
            .withUrl(url)
            .withMethod(method as any)
            .withQueryParams(queryParams)
            .build();

        el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(ctx, null, 2)}</pre>`;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">构建失败: ${err}</span>`;
    }
};

let baseCtx: any = null;

(window as any).__createBaseCtx = () => {
    const el = document.getElementById('ctx-base-result');
    baseCtx = createBaseContext({ metadata: { demo: true } });
    if (el) el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(baseCtx, null, 2)}</pre>`;
};

(window as any).__addStepCtx = () => {
    const el = document.getElementById('ctx-base-result');
    if (!baseCtx || !el) return;
    addStep(baseCtx, { name: 'ValidateProcessor', duration: 12, status: 'success' });
    addStep(baseCtx, { name: 'TransformProcessor', duration: 8, status: 'success' });
    el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(baseCtx, null, 2)}</pre>`;
};

(window as any).__setErrorCtx = () => {
    const el = document.getElementById('ctx-base-result');
    if (!baseCtx || !el) return;
    setError(baseCtx, new Error('验证失败'));
    el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(baseCtx, (k, v) => k === 'error' ? String(v) : v, 2)}</pre>`;
};

(window as any).__setTerminateCtx = () => {
    const el = document.getElementById('ctx-base-result');
    if (!baseCtx || !el) return;
    setTerminate(baseCtx, '验证失败，终止执行');
    const terminated = isTerminated(baseCtx);
    el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(baseCtx, (k, v) => k === 'error' ? String(v) : v, 2)}</pre>
    <div class="mt-2"><span class="badge ${terminated ? 'badge-danger' : 'badge-success'}">isTerminated: ${terminated}</span></div>`;
};
