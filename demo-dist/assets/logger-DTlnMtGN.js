import{r as y}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var i={},d={},c={};Object.defineProperty(c,"__esModule",{value:!0});c.colorLevel=x;const L="\x1B[0m",_={DEBUG:"\x1B[90m",WARN:"\x1B[33m",ERROR:"\x1B[31m"};function x(t,e){if(!e)return t;const o=_[t];return o?`${o}${t}${L}`:t}Object.defineProperty(d,"__esModule",{value:!0});d.format=$;const E=c;function $(t,e){var o;const r=new Date(t.timestamp).toISOString(),u=t.level.toUpperCase(),v=(0,E.colorLevel)(u,!!e.color),h=v.padEnd(v.length+Math.max(0,5-u.length)),w=t.category?t.category.padEnd(16):"";let a="";return t.error instanceof Error?a=t.error.stack||t.error.message:a=String((o=t.message)!==null&&o!==void 0?o:""),`${r} ${h} ${w} ${a}`}var g={};Object.defineProperty(g,"__esModule",{value:!0});g.consoleSink=C;function C(t,e){e==="error"?console.error(t):e==="warn"?console.warn(t):console.log(t)}var n={};Object.defineProperty(n,"__esModule",{value:!0});n.LoggerChild=void 0;class k{constructor(e,o){this.parent=e,this.category=o}log(e,o,...r){this.parent.emit({timestamp:Date.now(),level:e,category:this.category,message:o,data:r})}debug(e,...o){this.log("debug",e,...o)}info(e,...o){this.log("info",e,...o)}warn(e,...o){this.log("warn",e,...o)}error(e,...o){e instanceof Error?this.parent.emit({timestamp:Date.now(),level:"error",category:this.category,error:e,data:o}):this.log("error",e,...o)}}n.LoggerChild=k;Object.defineProperty(i,"__esModule",{value:!0});var p=i.Logger=void 0;const O=d,F=g,S=n,m=["debug","info","warn","error"];class s{constructor(e={}){this.options=e}static for(e){const o=typeof e=="string"?e:e.$ClassName||e.name;let r=this.children.get(o);return r||(r=new S.LoggerChild(this.root,o),this.children.set(o,r)),r}emit(e){if(!this.shouldLog(e.level))return;const o=(0,O.format)(e,this.options);(0,F.consoleSink)(o,e.level)}shouldLog(e){var o;const r=(o=this.options.level)!==null&&o!==void 0?o:"info";return m.indexOf(e)>=m.indexOf(r)}}p=i.Logger=s;s.children=new Map;s.root=new s;const l=[];function P(){l.length=0,y(`
        <div class="page-header">
            <h2>日志系统</h2>
            <p>@qimenjs/logger — Logger.for() 子记录器 + 四级日志 + 格式化输出</p>
        </div>

        <div class="section">
            <div class="section-title">日志级别说明</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>级别</th><th>用途</th><th>颜色</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">debug</span></td><td>调试信息，仅开发环境</td><td style="color:#888;">灰色</td></tr>
                        <tr><td><span class="badge badge-success">info</span></td><td>常规运行信息</td><td style="color:#4CAF50;">绿色</td></tr>
                        <tr><td><span class="badge badge-warning">warn</span></td><td>警告，不影响运行</td><td style="color:#FF9800;">橙色</td></tr>
                        <tr><td><span class="badge badge-danger">error</span></td><td>错误，需要关注</td><td style="color:#EF5350;">红色</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式日志输出</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>发送日志</div>
                    <div class="form-group">
                        <label>分类名</label>
                        <input id="log-category" class="input" value="UserService" placeholder="输入分类名">
                    </div>
                    <div class="form-group">
                        <label>日志消息</label>
                        <input id="log-message" class="input" value="用户登录成功" placeholder="输入日志消息">
                    </div>
                    <div class="form-group">
                        <label>日志级别</label>
                        <select id="log-level" class="input">
                            <option value="debug">debug</option>
                            <option value="info" selected>info</option>
                            <option value="warn">warn</option>
                            <option value="error">error</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__sendLog()">发送</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__clearLog()" style="margin-left:8px;">清空</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>Logger.for() 子记录器</div>
                    <p class="text-sm text-muted mb-3">使用 Logger.for() 创建带分类名的子记录器</p>
                    <div class="form-group">
                        <label>子记录器分类</label>
                        <input id="log-child-category" class="input" value="DataProcessor" placeholder="输入分类名">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__sendChildLog()">使用子记录器发送 info</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">日志流</div>
            <div class="card">
                <div id="log-stream" style="max-height:400px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待日志输出...</div>
                </div>
            </div>
        </div>
    `)}function b(t,e,o){const r=new Date().toLocaleTimeString("zh-CN",{hour12:!1});l.push({level:t,category:e,message:o,time:r}),f()}function f(){const t=document.getElementById("log-stream");if(!t)return;const e={debug:"#888",info:"#4CAF50",warn:"#FF9800",error:"#EF5350"};t.innerHTML=l.map(o=>{const r=e[o.level]||"#888";return`<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${o.time}</span>
            <span style="color:${r};font-weight:bold;margin:0 8px;">[${o.level.toUpperCase()}]</span>
            <span style="color:#6366F1;">[${o.category}]</span>
            <span style="color:#ccc;margin-left:8px;">${o.message}</span>
        </div>`}).join(""),t.scrollTop=t.scrollHeight}window.__sendLog=()=>{const t=document.getElementById("log-category").value||"App",e=document.getElementById("log-message").value,o=document.getElementById("log-level").value,r=p.for(t);switch(o){case"debug":r.debug(e);break;case"info":r.info(e);break;case"warn":r.warn(e);break;case"error":r.error(new Error(e));break}b(o,t,e)};window.__sendChildLog=()=>{const t=document.getElementById("log-child-category").value||"Child",e=p.for(t),o=`来自 ${t} 子记录器的日志`;e.info(o),b("info",t,o)};window.__clearLog=()=>{l.length=0,f()};export{P as renderLogger};
