import{r,R as n}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";function v(){r(`
        <div class="page-header">
            <h2>注册器</h2>
            <p>@qimenjs/registry — RegistryHub + DomainRegistrar / SystemRegistrar / HtmlTemplateRegistrar</p>
        </div>

        <div class="section">
            <div class="section-title">注册器体系</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>注册器</th><th>职责</th><th>注册内容</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">RegistryHub</span></td><td>统一管理所有注册器（纯静态类）</td><td>注册器实例</td></tr>
                        <tr><td><span class="badge badge-purple">DomainRegistrar</span></td><td>域配置注册</td><td>后端域（abp/spring/local）</td></tr>
                        <tr><td><span class="badge badge-warning">SystemRegistrar</span></td><td>系统配置注册</td><td>全局系统参数</td></tr>
                        <tr><td><span class="badge badge-success">HtmlTemplateRegistrar</span></td><td>HTML 模板注册</td><td>模板字符串</td></tr>
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
                    RegistryHub 提供 <code>lock()</code> 静态方法，锁定后不可再注册新的注册器。
                    这确保了系统初始化完成后配置的不可变性，防止运行时意外修改。
                </p>
                <div class="mt-2">
                    <span class="badge badge-success">当前状态: 已锁定</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">访问方式</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>方式</th><th>代码</th></tr></thead>
                    <tbody>
                        <tr><td>Registry 代理</td><td><code>Registry.domain</code></td></tr>
                        <tr><td>RegistryHub.get()</td><td><code>RegistryHub.get&lt;DomainRegistrar&gt;('domain')</code></td></tr>
                        <tr><td>单例</td><td><code>DomainRegistrar.getInstance()</code></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `)}window.__listDomains=()=>{const d=document.getElementById("reg-domains-result");if(d)try{const t=n.domain,e=["abp","spring","local"];let s='<div class="grid-3">';for(const a of e)try{const i=t.get(a);s+=`<div class="card" style="padding:12px;">
                    <div style="font-weight:bold;color:#6366F1;">${a}</div>
                    <div class="text-xs text-muted mt-1">${i?`baseUrl: ${i.baseUrl||"N/A"}`:"未注册"}</div>
                </div>`}catch{s+=`<div class="card" style="padding:12px;">
                    <div style="font-weight:bold;color:#EF5350;">${a}</div>
                    <div class="text-xs text-muted mt-1">未找到</div>
                </div>`}s+="</div>",d.innerHTML=s}catch(t){d.innerHTML=`<span class="badge badge-danger">查询失败: ${t}</span>`}};window.__queryDomain=()=>{const d=document.getElementById("reg-domain-name").value,t=document.getElementById("reg-domain-detail");if(t)try{const s=n.domain.get(d);t.innerHTML=`<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;color:#A855F7;">${JSON.stringify(s,null,2)}</pre>`}catch(e){t.innerHTML=`<span class="badge badge-danger">查询失败: ${e}</span>`}};export{v as renderRegistry};
