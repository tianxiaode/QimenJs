import{r as _}from"./index-OvYsTaGM.js";import{C as f}from"./ComposableBase-B596R9at.js";import E from"@/events";import S from"@/event-dom";import h from"@/registry";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";import"@/logger";import"@qimenjs/async";var u={},l={};Object.defineProperty(l,"__esModule",{value:!0});l.EventAbility=void 0;const D=E;l.EventAbility={eventScope:{get(){return this.abilityState("EventAbility:scope",()=>{const t=D.globalEventBus.createEventScope();return this.onCleanup(()=>t.dispose()),t})}},on(t,e){return this.eventScope.on(t,e)},once(t,e){return this.eventScope.once(t,e)},emit(t,e){this.eventScope.emit(t,e,this)}};var o={};Object.defineProperty(o,"__esModule",{value:!0});o.DomEventsAbility=void 0;const O=S;o.DomEventsAbility={bind(t,e,i){return this.abilityState("DomEventsAbility:adapter",()=>(0,O.createEventAdapter)()).bind(t,e,this.eventScope,i,this)}};var d={},r={};Object.defineProperty(r,"__esModule",{value:!0});r.DOMAIN_CACHE_SYMBOL=void 0;r.DOMAIN_CACHE_SYMBOL=Symbol("domain-config-cache");Object.defineProperty(d,"__esModule",{value:!0});d.DomainAbility=void 0;const M=h,A=r;d.DomainAbility={domainConfig:{get(){var t,e;let i=this.getStatic(A.DOMAIN_CACHE_SYMBOL);if(!i){const s=this.domain;s&&(i=M.DomainRegistrar.getInstance().get(s),this.setStatic(A.DOMAIN_CACHE_SYMBOL,i),(e=(t=this.logger)===null||t===void 0?void 0:t.debug)===null||e===void 0||e.call(t,`Domain [${s}] initialized and cached.`))}return i},enumerable:!0}};var c={};Object.defineProperty(c,"__esModule",{value:!0});c.SystemAbility=void 0;const C=h;c.SystemAbility={systemConfig(t){const e=C.SystemRegistrar.getInstance();return t!==void 0?e.get(t):e.getAll()}};(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.SystemAbility=t.DomainAbility=t.DomEventsAbility=t.EventAbility=void 0;var e=l;Object.defineProperty(t,"EventAbility",{enumerable:!0,get:function(){return e.EventAbility}});var i=o;Object.defineProperty(t,"DomEventsAbility",{enumerable:!0,get:function(){return i.DomEventsAbility}});var s=d;Object.defineProperty(t,"DomainAbility",{enumerable:!0,get:function(){return s.DomainAbility}});var n=c;Object.defineProperty(t,"SystemAbility",{enumerable:!0,get:function(){return n.SystemAbility}})})(u);const p=class p extends f{};p.abilities=[u.EventAbility];let m=p;const g=class g extends f{};g.abilities=[u.DomainAbility];let b=g,a=null;const y=[];function T(){a=new m,y.length=0,_(`
        <div class="page-header">
            <h2>系统能力</h2>
            <p>@qimenjs/system-abilities — EventAbility / DomEventsAbility / DomainAbility / SystemAbility</p>
        </div>

        <div class="section">
            <div class="section-title">能力体系</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>能力</th><th>提供方法</th><th>用途</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">EventAbility</span></td><td>on / once / emit</td><td>事件订阅与发布</td></tr>
                        <tr><td><span class="badge badge-purple">DomEventsAbility</span></td><td>bind</td><td>DOM 事件与手势绑定</td></tr>
                        <tr><td><span class="badge badge-success">DomainAbility</span></td><td>domainConfig</td><td>获取域配置</td></tr>
                        <tr><td><span class="badge badge-warning">SystemAbility</span></td><td>systemConfig</td><td>获取系统配置</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">EventAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>事件能力</div>
                <p class="text-sm text-muted mb-3">通过 EventAbility，组件获得 on/once/emit 方法</p>
                <div class="grid-2">
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="sys-evt-name" class="input" value="data:change" placeholder="事件名">
                    </div>
                    <div class="form-group">
                        <label>数据 (JSON)</label>
                        <input id="sys-evt-data" class="input" value='{"value":42}' placeholder="JSON 数据">
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__sysSubscribe()">订阅 (on)</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__sysEmit()">发布 (emit)</button>
                </div>
                <div id="sys-evt-log" class="mt-3 text-sm" style="max-height:150px;overflow-y:auto;"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">DomainAbility 演示</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>域能力</div>
                <p class="text-sm text-muted mb-3">通过 DomainAbility，组件可获取所属域的配置信息</p>
                <div class="form-group">
                    <label>选择域</label>
                    <select id="sys-domain" class="input">
                        <option value="abp">abp</option>
                        <option value="spring">spring</option>
                        <option value="local">local</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__sysDomainConfig()">获取域配置</button>
                <div id="sys-domain-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">组合使用</div>
            <div class="card">
                <p class="text-sm" style="line-height:1.8;">
                    系统能力可以自由组合。例如一个完整的组件可以同时拥有 EventAbility + DomEventsAbility + DomainAbility + SystemAbility，
                    通过 <code>static readonly abilities = [EventAbility, DomEventsAbility, DomainAbility, SystemAbility]</code> 声明。
                    这就是 QimenJS 的能力组合模式。
                </p>
            </div>
        </div>
    `)}window.__sysSubscribe=()=>{if(!a)return;const t=document.getElementById("sys-evt-name").value;a.on(t,i=>{const s=new Date().toLocaleTimeString("zh-CN",{hour12:!1});y.push({time:s,event:t,data:JSON.stringify(i.data)});const n=document.getElementById("sys-evt-log");n&&(n.innerHTML=y.map(v=>`<div style="color:#4CAF50;">[${v.time}] 收到 ${v.event}: ${v.data}</div>`).join(""),n.scrollTop=n.scrollHeight)});const e=document.getElementById("sys-evt-log");e&&(e.innerHTML+=`<div style="color:#6366F1;">已订阅: ${t}</div>`)};window.__sysEmit=()=>{if(!a)return;const t=document.getElementById("sys-evt-name").value,e=document.getElementById("sys-evt-data").value;let i;try{i=JSON.parse(e)}catch{i=e}a.emit(t,i)};window.__sysDomainConfig=()=>{document.getElementById("sys-domain").value;const t=document.getElementById("sys-domain-result");if(t)try{const e=new b;t.innerHTML=`<div class="text-sm"><span class="badge badge-info">DomainAbility</span> 已创建组件</div>
        <div class="text-muted text-xs mt-1">domainConfig 属性需要组件在域上下文中使用时才能获取配置</div>`}catch(e){t.innerHTML=`<span class="badge badge-danger">失败: ${e}</span>`}};export{T as renderSystemAbilities};
