import{r as h}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var p={};Object.defineProperty(p,"__esModule",{value:!0});var y=p.debounce=f;function f(e,l=0,i=!1){let t=null;const n=function(...o){const s=i&&!t;if(t&&clearTimeout(t),t=setTimeout(()=>{t=null,i||e.apply(this,o)},l),s)return e.apply(this,o)};return n.cancel=()=>{t&&(clearTimeout(t),t=null)},n}var v={};Object.defineProperty(v,"__esModule",{value:!0});var g=v.throttle=w;function w(e,l=0){let i=0,t=null;return function(...n){const o=Date.now(),s=l-(o-i);s<=0?(i=o,e.apply(this,n)):t||(t=setTimeout(()=>{t=null,i=Date.now(),e.apply(this,n)},s))}}let d=0,u=0,a=[],m=[],c=null;function C(){d=0,u=0,a=[],m=[],h(`
        <div class="page-header">
            <h2>异步工具</h2>
            <p>@qimenjs/async — debounce 防抖 + throttle 节流</p>
        </div>

        <div class="section">
            <div class="section-title">防抖 (debounce)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>输入框实时演示</div>
                <p class="text-sm text-muted mb-3">在输入框中快速输入，观察防抖效果：只有停止输入后才触发</p>
                <div class="form-group">
                    <label>等待时间 (ms)</label>
                    <input id="async-debounce-wait" class="input" type="number" value="500" min="100" max="3000" step="100">
                </div>
                <div class="form-group">
                    <label>搜索输入（防抖）</label>
                    <input id="async-debounce-input" class="input" placeholder="快速输入文字..." oninput="window.__debounceInput()">
                </div>
                <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm" onclick="window.__resetDebounce()">重置</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__cancelDebounce()">cancel()</button>
                </div>
                <div class="mt-3">
                    <span class="badge badge-info">实际调用次数: <span id="async-debounce-count">0</span></span>
                </div>
                <div id="async-debounce-timeline" class="mt-2 text-sm" style="max-height:150px;overflow-y:auto;"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">节流 (throttle)</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>按钮点击演示</div>
                <p class="text-sm text-muted mb-3">快速点击按钮，观察节流效果：固定时间间隔内只触发一次</p>
                <div class="form-group">
                    <label>间隔时间 (ms)</label>
                    <input id="async-throttle-wait" class="input" type="number" value="1000" min="100" max="5000" step="100">
                </div>
                <button class="btn btn-primary" onclick="window.__throttleClick()">点击我 (节流)</button>
                <div class="mt-3">
                    <span class="badge badge-info">实际调用次数: <span id="async-throttle-count">0</span></span>
                    <span class="badge badge-muted ml-2" id="async-throttle-total">总点击: 0</span>
                </div>
                <div id="async-throttle-timeline" class="mt-2 text-sm" style="max-height:150px;overflow-y:auto;"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">防抖 vs 节流 对比</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>特性</th><th>debounce</th><th>throttle</th></tr></thead>
                    <tbody>
                        <tr><td>触发时机</td><td>停止后延迟触发</td><td>固定间隔触发</td></tr>
                        <tr><td>适用场景</td><td>搜索输入、窗口调整</td><td>滚动事件、按钮防连点</td></tr>
                        <tr><td>取消支持</td><td>cancel()</td><td>无</td></tr>
                        <tr><td>immediate 选项</td><td>支持（首次立即触发）</td><td>无</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `)}let b=0,r=null;window.__debounceInput=()=>{const e=Number(document.getElementById("async-debounce-wait").value)||500,l=document.getElementById("async-debounce-input").value;c&&c.cancel(),c=y(i=>{d++;const t=new Date().toLocaleTimeString("zh-CN",{hour12:!1});a.push(`[${t}] 调用 #${d}: "${i}"`);const n=document.getElementById("async-debounce-count");n&&(n.textContent=String(d));const o=document.getElementById("async-debounce-timeline");o&&(o.innerHTML=a.map(s=>`<div style="color:#4CAF50;">${s}</div>`).join("")),o&&(o.scrollTop=o.scrollHeight)},e),c(l)};window.__resetDebounce=()=>{d=0,a=[],c&&c.cancel();const e=document.getElementById("async-debounce-count");e&&(e.textContent="0");const l=document.getElementById("async-debounce-timeline");l&&(l.innerHTML="")};window.__cancelDebounce=()=>{if(c){c.cancel();const e=new Date().toLocaleTimeString("zh-CN",{hour12:!1}),l=document.getElementById("async-debounce-timeline");l&&(a.push(`[${e}] <span style="color:#EF5350;">cancel() 已取消</span>`),l.innerHTML=a.map(i=>`<div>${i}</div>`).join(""))}};window.__throttleClick=()=>{b++;const e=document.getElementById("async-throttle-total");e&&(e.textContent=`总点击: ${b}`);const l=Number(document.getElementById("async-throttle-wait").value)||1e3;r||(r=g(()=>{u++;const i=new Date().toLocaleTimeString("zh-CN",{hour12:!1});m.push(`[${i}] 调用 #${u}`);const t=document.getElementById("async-throttle-count");t&&(t.textContent=String(u));const n=document.getElementById("async-throttle-timeline");n&&(n.innerHTML=m.map(o=>`<div style="color:#A855F7;">${o}</div>`).join("")),n&&(n.scrollTop=n.scrollHeight)},l)),r()};export{C as renderAsync};
