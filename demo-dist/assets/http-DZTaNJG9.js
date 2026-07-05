import{r as s}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";function n(){s(`
        <div class="page-header">
            <h2>HTTP 客户端</h2>
            <p>@qimenjs/http — HttpClient + Pipeline + Context 请求模式</p>
        </div>

        <div class="section">
            <div class="section-title">HTTP 客户端架构</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    HttpClient 基于 Pipeline + Context 模式构建。每个请求经过管道处理：
                    <code>请求构建 → 前道处理器（Token注入等） → HTTP 交换 → 后道处理器（数据转换） → 响应返回</code>。
                    支持 ABP/Spring 两种后端格式的自动适配。
                </p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">请求管道流程</div>
            <div class="card">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;">
                    <span class="badge badge-info">RequestContext</span>
                    <span style="color:#666;">→</span>
                    <span class="badge badge-purple">TokenInjector</span>
                    <span style="color:#666;">→</span>
                    <span class="badge badge-warning">DataProcessor(前道)</span>
                    <span style="color:#666;">→</span>
                    <span class="badge badge-success">HTTP Exchange</span>
                    <span style="color:#666;">→</span>
                    <span class="badge badge-warning">DataProcessor(后道)</span>
                    <span style="color:#666;">→</span>
                    <span class="badge badge-info">Response</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">核心组件</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>组件</th><th>职责</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">HttpClient</span></td><td>HTTP 请求客户端，支持 GET/POST/PUT/DELETE</td></tr>
                        <tr><td><span class="badge badge-purple">HttpExecutor</span></td><td>请求执行器，管理管道和上下文</td></tr>
                        <tr><td><span class="badge badge-success">StreamClient</span></td><td>流式请求客户端，支持 SSE/流式响应</td></tr>
                        <tr><td><span class="badge badge-warning">Actions</span></td><td>预定义 HTTP 动作常量</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">请求示例</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>代码示例</div>
                <pre style="background:#0A0A0B;padding:16px;border-radius:8px;overflow:auto;font-size:12px;color:#A855F7;">// 通过 EntityManager 自动使用 HttpClient
const users = await abpUserManager.list();

// 请求管道自动处理:
// 1. TokenInjector 注入 Bearer Token
// 2. ABP 前道处理器转换分页参数
// 3. 发送 HTTP 请求
// 4. ABP 后道处理器转换响应格式
// 5. 返回标准化数据</pre>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Token 注入</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    域配置中的 <code>authInjector: 'bearer'</code> 会自动在请求管道中注入 TokenInjector 处理器，
                    从 OAuth2Manager 获取 access_token 并添加到请求头 <code>Authorization: Bearer {token}</code>。
                    Token 过期时自动刷新。
                </p>
            </div>
        </div>
    `)}export{n as renderHttp};
