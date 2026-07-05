import{r as x}from"./index-OvYsTaGM.js";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var o={};Object.defineProperty(o,"__esModule",{value:!0});var w=o.getLocale=h;function h(){return navigator.language||navigator.userLanguage||"zh-CN"}var i={};Object.defineProperty(i,"__esModule",{value:!0});var $=i.getTimezone=_;function _(){return Intl.DateTimeFormat().resolvedOptions().timeZone}var l={};Object.defineProperty(l,"__esModule",{value:!0});var k=l.getPlatform=P;function P(){return typeof window<"u"?"browser":typeof process<"u"?"node":"unknown"}var p={};Object.defineProperty(p,"__esModule",{value:!0});var M=p.getUserAgent=j;function j(){return typeof navigator<"u"?navigator.userAgent:""}var u={};Object.defineProperty(u,"__esModule",{value:!0});var n=u.runtimeFeatures=void 0;n=u.runtimeFeatures={fetch:typeof fetch=="function",localStorage:typeof localStorage<"u",intersectionObserver:typeof IntersectionObserver<"u"};var m={};Object.defineProperty(m,"__esModule",{value:!0});var T=m.getRuntimeEnv=F;const O=o,A=i,z=l;function F(){return{locale:(0,O.getLocale)(),timezone:(0,A.getTimezone)(),platform:(0,z.getPlatform)()}}var g={};Object.defineProperty(g,"__esModule",{value:!0});var S=g.isTouchDevice=E,C=g.detectInputCapabilities=I;function E(){return typeof window>"u"?!1:"ontouchstart"in window||navigator.maxTouchPoints>0}function I(){if(typeof window>"u")return{touch:!1,mouse:!1,pointer:!1};const e="ontouchstart"in window||navigator.maxTouchPoints>0,a=typeof window.PointerEvent<"u";return{touch:e,mouse:!0,pointer:a}}function U(){var b;const e=T(),a=k(),s=w(),v=$(),f=M(),y=S(),t=C(),r={};n&&typeof n=="object"&&Object.entries(n).forEach(([c,d])=>{typeof d=="boolean"&&(r[c]=d)}),x(`
        <div class="page-header">
            <h2>运行时检测</h2>
            <p>@qimenjs/runtime — 浏览器/Node.js 环境检测 + 特性探测</p>
        </div>

        <div class="section">
            <div class="section-title">环境信息</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>运行环境</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">运行时</td><td>${e||"browser"}</td></tr>
                            <tr><td class="text-muted">平台</td><td>${a||"unknown"}</td></tr>
                            <tr><td class="text-muted">语言</td><td>${s||navigator.language}</td></tr>
                            <tr><td class="text-muted">时区</td><td>${v||Intl.DateTimeFormat().resolvedOptions().timeZone}</td></tr>
                            <tr><td class="text-muted">UserAgent</td><td style="word-break:break-all;font-size:12px;">${f||navigator.userAgent}</td></tr>
                            <tr><td class="text-muted">触摸设备</td><td>${y?'<span class="badge badge-success">是</span>':'<span class="badge badge-danger">否</span>'}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>输入能力</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">触摸</td><td>${t!=null&&t.touch?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">鼠标</td><td>${t!=null&&t.mouse?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">键盘</td><td>${t!=null&&t.keyboard?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">手写笔</td><td>${t!=null&&t.pen?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">特性支持</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>runtimeFeatures</div>
                    <table class="data-table">
                        <tbody>
                            ${Object.keys(r).length>0?Object.entries(r).map(([c,d])=>`<tr><td class="text-muted">${c}</td><td>${d?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>`).join(""):'<tr><td colspan="2" class="text-muted">无特性标记</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#F59E0B;"></span>浏览器 API</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">ServiceWorker</td><td>${"serviceWorker"in navigator?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebSocket</td><td>${"WebSocket"in window?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">IndexedDB</td><td>${"indexedDB"in window?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebGL</td><td>${L()?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebRTC</td><td>${"RTCPeerConnection"in window?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">Notification</td><td>${"Notification"in window?'<span class="badge badge-success">支持</span>':'<span class="badge badge-danger">不支持</span>'}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">性能指标</div>
            <div class="card">
                <table class="data-table">
                    <tbody>
                        <tr><td class="text-muted">内存（JS Heap）</td><td>${W()}</td></tr>
                        <tr><td class="text-muted">CPU 核心数</td><td>${navigator.hardwareConcurrency||"N/A"}</td></tr>
                        <tr><td class="text-muted">网络类型</td><td>${((b=navigator.connection)==null?void 0:b.effectiveType)||"N/A"}</td></tr>
                        <tr><td class="text-muted">在线状态</td><td>${navigator.onLine?'<span class="badge badge-success">在线</span>':'<span class="badge badge-danger">离线</span>'}</td></tr>
                        <tr><td class="text-muted">Cookie 启用</td><td>${navigator.cookieEnabled?'<span class="badge badge-success">是</span>':'<span class="badge badge-danger">否</span>'}</td></tr>
                        <tr><td class="text-muted">屏幕</td><td>${screen.width}×${screen.height} @${window.devicePixelRatio}x</td></tr>
                        <tr><td class="text-muted">视口</td><td>${window.innerWidth}×${window.innerHeight}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">MemoryManager</div>
            <div class="card">
                <p class="text-sm text-muted" style="margin-bottom:12px;">@qimenjs/runtime 提供的内存管理器，支持内存快照、阈值监控和票据机制。</p>
                <table class="data-table">
                    <tbody>
                        <tr><td class="text-muted">MemoryManager</td><td>内存管理器类，提供 snapshot() / watch() / ticket() 等方法</td></tr>
                        <tr><td class="text-muted">MemoryTicket</td><td>内存票据类，用于申请和释放内存配额</td></tr>
                        <tr><td class="text-muted">MemorySnapshot</td><td>内存快照接口，记录 used / total / limit 等信息</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `)}function L(){try{const e=document.createElement("canvas");return!!(e.getContext("webgl")||e.getContext("experimental-webgl"))}catch{return!1}}function W(){const e=performance;if(e.memory){const a=(e.memory.usedJSHeapSize/1048576).toFixed(1),s=(e.memory.totalJSHeapSize/1048576).toFixed(1);return`${a} MB / ${s} MB`}return"N/A（仅 Chrome 支持）"}export{U as renderRuntime};
