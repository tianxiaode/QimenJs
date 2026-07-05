import{r as l}from"./index-OvYsTaGM.js";import{E as r}from"./EventBus-Duu_hJnQ.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";import"@qimenjs/utils";const o=[];let n=null,a=null;function f(){o.length=0,n=new r,a=n.createScope(),l(`
        <div class="page-header">
            <h2>事件总线</h2>
            <p>@qimenjs/events — EventBus / EventScope / globalEventBus</p>
        </div>

        <div class="section">
            <div class="section-title">架构说明</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>组件</th><th>职责</th><th>生命周期</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">EventBus</span></td><td>事件订阅/发布核心</td><td>手动管理</td></tr>
                        <tr><td><span class="badge badge-purple">EventScope</span></td><td>作用域隔离，自动清理</td><td>dispose() 自动解绑</td></tr>
                        <tr><td><span class="badge badge-success">globalEventBus</span></td><td>全局单例事件总线</td><td>应用级</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式事件操作</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>订阅事件 (on)</div>
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="evt-name" class="input" value="user:login" placeholder="输入事件名">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__subscribeEvent()">订阅</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__subscribeOnce()" style="margin-left:8px;">once 订阅</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>发布事件 (emit)</div>
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="evt-emit-name" class="input" value="user:login" placeholder="输入事件名">
                    </div>
                    <div class="form-group">
                        <label>数据 (JSON)</label>
                        <input id="evt-emit-data" class="input" value='{"userId":"123"}' placeholder="JSON 数据">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__emitEvent()">发布</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">作用域管理</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>EventScope 自动清理</div>
                <p class="text-sm text-muted mb-3">创建作用域后订阅的事件，在 dispose() 时自动全部解绑</p>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__scopeSubscribe()">作用域订阅</button>
                    <button class="btn btn-danger btn-sm" onclick="window.__scopeDispose()">dispose() 销毁</button>
                </div>
                <div id="evt-scope-status" class="mt-2 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">事件流日志</div>
            <div class="card">
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__clearEventLog()">清空日志</button>
                </div>
                <div id="evt-log" style="max-height:300px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待事件...</div>
                </div>
            </div>
        </div>
    `)}function i(t,s,e){const d=new Date().toLocaleTimeString("zh-CN",{hour12:!1});o.push({time:d,type:t,event:s,data:e}),c()}function c(){const t=document.getElementById("evt-log");if(!t)return;const s={subscribe:"#4CAF50",emit:"#6366F1",receive:"#A855F7",dispose:"#EF5350",once:"#FF9800"};t.innerHTML=o.map(e=>{const d=s[e.type]||"#888";return`<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:${d};font-weight:bold;margin:0 8px;">[${e.type.toUpperCase()}]</span>
            <span style="color:#6366F1;">${e.event}</span>
            <span style="color:#888;margin-left:8px;">${e.data}</span>
        </div>`}).join(""),t.scrollTop=t.scrollHeight}window.__subscribeEvent=()=>{const t=document.getElementById("evt-name").value;n&&(n.on(t,s=>{i("receive",t,JSON.stringify(s.data))}),i("subscribe",t,"on() - 持续订阅"))};window.__subscribeOnce=()=>{const t=document.getElementById("evt-name").value;n&&(n.once(t,s=>{i("receive",t,"once() - 一次性触发")}),i("once",t,"once() - 一次性订阅"))};window.__emitEvent=()=>{const t=document.getElementById("evt-emit-name").value,s=document.getElementById("evt-emit-data").value;if(!n)return;let e;try{e=JSON.parse(s)}catch{e=s}n.emit(t,e),i("emit",t,JSON.stringify(e))};window.__scopeSubscribe=()=>{if(!a)return;a.on("scope:event",s=>{i("receive","scope:event",JSON.stringify(s.data))}),i("subscribe","scope:event","作用域订阅");const t=document.getElementById("evt-scope-status");t&&(t.innerHTML='<span class="badge badge-success">作用域活跃 - 已订阅 scope:event</span>')};window.__scopeDispose=()=>{a&&(a.dispose(),i("dispose","scope:event","作用域已销毁，所有订阅自动解绑"));const t=document.getElementById("evt-scope-status");t&&(t.innerHTML='<span class="badge badge-danger">作用域已销毁</span>')};window.__clearEventLog=()=>{o.length=0,c()};export{f as renderEvents};
