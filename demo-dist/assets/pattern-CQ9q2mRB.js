import{r as u}from"./index-OvYsTaGM.js";import l from"@qimenjs/registry";import"@qimenjs/error";import"@/registry/registrars/DomainRegistrar";var o={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.PatternRegistrar=e.PatternRegistrarName=void 0;const a=l,t=l;e.PatternRegistrarName="pattern";class i extends a.RegistrarBase{constructor(){super(...arguments),this.name=e.PatternRegistrarName,this.storage=new Map}register(s,r){if(this.checkLock(),typeof s=="object"&&!(s instanceof RegExp))for(const[n,g]of Object.entries(s))this.doRegister(n,g);else if(typeof s=="string"){if(!r)throw new t.RegistrarInvalidArgumentError(this.name,s);this.doRegister(s,r)}}unregister(s){this.checkLock(),this.storage.delete(s)}doRegister(s,r){this.storage.set(s,r)}get(s){const r=this.storage.get(s);if(!r)throw new t.RegistrarNotFoundError(this.name,s);return r}doInspect(){console.group("🔍 Registered Patterns");const s={};this.storage.forEach((r,n)=>{s[n]={source:r.source,flags:r.flags}}),console.table(s),console.groupEnd()}}e.PatternRegistrar=i})(o);var c={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.VALIDATION_PATTERNS=e.PASSWORD_PATTERNS=e.FORMAT_PATTERNS=void 0,e.FORMAT_PATTERNS={email:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,url:/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,ipv4:/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,ipv6:/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})$/,mac:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,phone:/^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,uuid:/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,base64:/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,hexColor:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,rgbColor:/^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,rgbaColor:/^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(0|0?\.\d+|1|100%?)\s*\)$/,creditCard:/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,chineseId:/^[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,chinesePostcode:/^[1-9]\d{5}$/,username:/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/},e.PASSWORD_PATTERNS={uppercase:/[A-Z]/,lowercase:/[a-z]/,digit:/\d/,specialChar:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/},e.VALIDATION_PATTERNS={...e.FORMAT_PATTERNS,...e.PASSWORD_PATTERNS}})(c);function f(){const e=Object.entries(c.FORMAT_PATTERNS),a=Object.entries(c.PASSWORD_PATTERNS);u(`
        <div class="page-header">
            <h2>模式匹配</h2>
            <p>@qimenjs/pattern — PatternRegistrar 命名正则注册与验证</p>
        </div>

        <div class="section">
            <div class="section-title">交互式验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>选择模式 + 测试字符串</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>选择模式</label>
                        <select id="pat-name" class="input">
                            ${[...e,...a].map(([t])=>`<option value="${t}">${t}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>测试字符串</label>
                        <input id="pat-test" class="input" value="user@example.com" placeholder="输入测试字符串">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__testPattern()">验证</button>
                <div id="pat-test-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">自定义模式注册</div>
            <div class="card">
                <div class="grid-2">
                    <div class="form-group">
                        <label>模式名称</label>
                        <input id="pat-custom-name" class="input" value="productCode" placeholder="模式名称">
                    </div>
                    <div class="form-group">
                        <label>正则表达式</label>
                        <input id="pat-custom-regex" class="input" value="^[A-Z]{3}\\d{4}$" placeholder="正则表达式">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__registerCustomPattern()">注册</button>
                <div id="pat-custom-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">格式验证模式 (FORMAT_PATTERNS)</div>
            <div class="card">
                <div class="grid-3">
                    ${e.map(([t,i])=>`<div class="text-xs" style="padding:4px 8px;cursor:pointer;" onclick="window.__selectPattern('${t}')">
                            <span class="badge badge-info">${t}</span>
                            <div class="text-muted mt-1" style="word-break:break-all;">${i}</div>
                        </div>`).join("")}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">密码验证模式 (PASSWORD_PATTERNS)</div>
            <div class="card">
                <div class="grid-2">
                    ${a.map(([t,i])=>`<div class="text-xs" style="padding:4px 8px;cursor:pointer;" onclick="window.__selectPattern('${t}')">
                            <span class="badge badge-warning">${t}</span>
                            <div class="text-muted mt-1" style="word-break:break-all;">${i}</div>
                        </div>`).join("")}
                </div>
            </div>
        </div>
    `)}window.__testPattern=()=>{const e=document.getElementById("pat-name").value,a=document.getElementById("pat-test").value,t=document.getElementById("pat-test-result");if(t)try{const d=o.PatternRegistrar.getInstance().get(e),s=d.test(a);t.innerHTML=`
            <div><span class="badge ${s?"badge-success":"badge-danger"}">${s?"匹配成功":"不匹配"}</span></div>
            <div class="mt-2 text-muted">模式: ${d}</div>
            <div class="text-muted">输入: "${a}"</div>
        `}catch(i){t.innerHTML=`<span class="badge badge-danger">查询失败: ${i}</span>`}};window.__selectPattern=e=>{const a=document.getElementById("pat-name"),t=document.getElementById("pat-test");a&&(a.value=e),t&&t.focus()};window.__registerCustomPattern=()=>{const e=document.getElementById("pat-custom-name").value,a=document.getElementById("pat-custom-regex").value,t=document.getElementById("pat-custom-result");if(!(!t||!e||!a))try{const i=new RegExp(a);o.PatternRegistrar.getInstance().register(e,i),t.innerHTML=`<span class="badge badge-success">注册成功: ${e} → ${a}</span>`}catch(i){t.innerHTML=`<span class="badge badge-danger">注册失败: ${i}</span>`}};export{f as renderPattern};
