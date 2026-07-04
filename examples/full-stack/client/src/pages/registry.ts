/**
 * 注册器页 - @orbitjs/registry
 */
import { RegistryHub, DomainRegistrar, SchemaRegistrar, SystemRegistrar } from '@orbitjs/registry';
import { renderPageContent } from '../layout';

export function renderRegistry(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>注册器</h2>
            <p>@orbitjs/registry — RegistryHub + DomainRegistrar / SchemaRegistrar / SystemRegistrar</p>
        </div>

        <div class="section">
            <div class="section-title">注册器体系</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>注册器</th><th>职责</th><th>注册内容</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">RegistryHub</span></td><td>统一管理所有注册器</td><td>注册器实例</td></tr>
                        <tr><td><span class="badge badge-purple">DomainRegistrar</span></td><td>域配置注册</td><td>后端域（abp/spring/local）</td></tr>
                        <tr><td><span class="badge badge-success">SchemaRegistrar</span></td><td>实体 Schema 注册</td><td>实体结构定义</td></tr>
                        <tr><td><span class="badge badge-warning">SystemRegistrar</span></td><td>系统配置注册</td><td>全局系统参数</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">已注册域</div>
            <div class="card">
                <button class="btn btn-primary btn-sm" onclick="window.__listDomains()">查看已注册域</button>
                <div id="reg-domains-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式域查询</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>查询域配置</div>
                <div class="form-group">
                    <label>域名</label>
                    <select id="reg-domain-name" class="input">
                        <option value="abp">abp</option>
                        <option value="spring">spring</option>
                        <option value="local">local</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__queryDomain()">查询</button>
                <div id="reg-domain-detail" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">RegistryHub 锁定机制</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    RegistryHub 提供 <code>lock()</code> 方法，锁定后不可再注册新的注册器。
                    这确保了系统初始化完成后配置的不可变性，防止运行时意外修改。
                </p>
                <div class="mt-2">
                    <span class="badge badge-success">当前状态: 已锁定</span>
                </div>
            </div>
        </div>
    `);
}

(window as any).__listDomains = () => {
    const el = document.getElementById('reg-domains-result');
    if (!el) return;
    try {
        const hub = RegistryHub.getInstance();
        const domainRegistrar = hub.getRegistrar<DomainRegistrar>('domain');
        const schemaRegistrar = hub.getRegistrar<SchemaRegistrar>('schema');

        const domains = ['abp', 'spring', 'local'];
        let html = '<div class="grid-3">';
        for (const name of domains) {
            try {
                const config = domainRegistrar.get(name);
                html += `<div class="card" style="padding:12px;">
                    <div style="font-weight:bold;color:#6366F1;">${name}</div>
                    <div class="text-xs text-muted mt-1">${config ? `baseUrl: ${config.baseUrl || 'N/A'}` : '未注册'}</div>
                </div>`;
            } catch {
                html += `<div class="card" style="padding:12px;">
                    <div style="font-weight:bold;color:#EF5350;">${name}</div>
                    <div class="text-xs text-muted mt-1">未找到</div>
                </div>`;
            }
        }
        html += '</div>';
        el.innerHTML = html;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">查询失败: ${err}</span>`;
    }
};

(window as any).__queryDomain = () => {
    const name = (document.getElementById('reg-domain-name') as HTMLSelectElement).value;
    const el = document.getElementById('reg-domain-detail');
    if (!el) return;
    try {
        const hub = RegistryHub.getInstance();
        const domainRegistrar = hub.getRegistrar<DomainRegistrar>('domain');
        const config = domainRegistrar.get(name);
        el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(config, null, 2)}</pre>`;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">查询失败: ${err}</span>`;
    }
};
