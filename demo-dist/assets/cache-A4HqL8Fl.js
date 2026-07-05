import{r as v}from"./index-OvYsTaGM.js";import u from"@qimenjs/logger";import g from"@qimenjs/utils";import"@qimenjs/error";import"@qimenjs/registry";import"@/registry/registrars/DomainRegistrar";var n={};Object.defineProperty(n,"__esModule",{value:!0});n.BaseCacheProvider=void 0;const y=g;class p{constructor(){this.id="",this.type="",this.id=y.string.getId(this.type+"-cache")}async get(e){const t=this.resolveKey(e),a=await this.rawGet(t);return a?a.ttl>0&&Date.now()-a.timestamp>a.ttl?(await this.remove(e),null):a.data:null}async set(e,t,a=0){const r=this.resolveKey(e),m={data:t,timestamp:Date.now(),ttl:a};await this.rawSet(r,m)}resolveKey(e){return`${this.type}-cache:${String(e)}`}}n.BaseCacheProvider=p;var d={},i={};Object.defineProperty(i,"__esModule",{value:!0});var o=i.MemoryProvider=void 0;const h=n;class b extends h.BaseCacheProvider{constructor(){super(),this.storage=new Map,this.type="memory"}async rawGet(e){return this.storage.get(e)||null}async rawSet(e,t){this.storage.set(e,t)}async has(e){return this.storage.has(this.resolveKey(e))}async remove(e){this.storage.delete(this.resolveKey(e))}async clear(){this.storage.clear()}}o=i.MemoryProvider=b;Object.defineProperty(d,"__esModule",{value:!0});var c=d.CacheFactory=void 0;const w=u,_=i;class l{static async create(e,t=!1){w.Logger.for("CacheFactory").debug("Creating cache provider",e);const r=new _.MemoryProvider;return this._instances.set(r.id,r),r}static release(e,t=!1){const a=this._instances.get(e);a&&(t&&a.clear(),this._instances.delete(e))}}c=d.CacheFactory=l;l._instances=new Map;function F(){v(`
        <div class="page-header">
            <h2>缓存系统</h2>
            <p>@qimenjs/cache — MemoryProvider + CacheFactory + TTL 过期机制</p>
        </div>

        <div class="section">
            <div class="section-title">CacheFactory 缓存操作</div>
            <div class="card">
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-primary btn-sm" onclick="window.__cacheSet()">写入缓存</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__cacheGet()">读取缓存</button>
                    <button class="btn btn-danger btn-sm" onclick="window.__cacheRemove()">删除缓存</button>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>缓存 Key</label>
                        <input id="cache-key" class="input" value="demo-key" placeholder="缓存键名">
                    </div>
                    <div class="form-group">
                        <label>缓存 Value (JSON)</label>
                        <input id="cache-value" class="input" value='{"name":"QimenJS","version":"2.0"}' placeholder="缓存值">
                    </div>
                </div>
                <div id="cache-result" class="mt-2 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">MemoryProvider 直接使用</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>直接实例化 MemoryProvider</div>
                <p class="text-sm text-muted mb-3">不通过 CacheFactory，直接创建 MemoryProvider 实例</p>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__memCacheDemo()">演示 MemoryProvider</button>
                </div>
                <div id="cache-mem-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">TTL 过期机制</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#A855F7;"></span>缓存过期演示</div>
                <p class="text-sm text-muted mb-3">设置 3 秒 TTL，写入后等待过期</p>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__cacheTTLSet()">写入 (TTL=3s)</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__cacheTTLGet()">立即读取</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__cacheTTLGetAfter()">3秒后读取</button>
                </div>
                <div id="cache-ttl-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">CacheFactory.release() 资源释放</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>释放缓存实例</div>
                <p class="text-sm text-muted mb-3">CacheFactory.release() 释放指定 ID 的缓存实例</p>
                <button class="btn btn-primary btn-sm" onclick="window.__cacheRelease()">演示 release</button>
                <div id="cache-release-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">缓存策略说明</div>
            <div class="grid-3">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>Memory</div>
                    <div class="text-sm text-muted">内存缓存，进程内有效，最快速度</div>
                    <div class="text-xs text-muted mt-1"><span class="badge badge-success">已实现</span></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>LocalStorage</div>
                    <div class="text-sm text-muted">浏览器持久化，关闭后仍有效</div>
                    <div class="text-xs text-muted mt-1"><span class="badge badge-warning">当前回退到 Memory</span></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>SessionStorage</div>
                    <div class="text-sm text-muted">会话级缓存，标签页关闭后清除</div>
                    <div class="text-xs text-muted mt-1"><span class="badge badge-warning">当前回退到 Memory</span></div>
                </div>
            </div>
            <div class="mt-3 text-sm text-muted">
                注意：当前版本 CacheFactory.create('local') 和 CacheFactory.create('session') 内部回退为 MemoryProvider。
                localStorage/sessionStorage 策略将在后续版本实现。
            </div>
        </div>
    `)}window.__cacheSet=async()=>{const s=document.getElementById("cache-key").value,e=document.getElementById("cache-value").value;try{await(await c.create("memory")).set(s,JSON.parse(e)),document.getElementById("cache-result").innerHTML='<span class="badge badge-success">写入成功</span>'}catch(t){document.getElementById("cache-result").innerHTML=`<span class="badge badge-danger">${t.message}</span>`}};window.__cacheGet=async()=>{const s=document.getElementById("cache-key").value;try{const t=await(await c.create("memory")).get(s);document.getElementById("cache-result").innerHTML=t?`<span class="badge badge-success">读取成功</span> <code class="text-muted">${JSON.stringify(t)}</code>`:'<span class="badge badge-warning">缓存不存在</span>'}catch(e){document.getElementById("cache-result").innerHTML=`<span class="badge badge-danger">${e.message}</span>`}};window.__cacheRemove=async()=>{const s=document.getElementById("cache-key").value;try{await(await c.create("memory")).remove(s),document.getElementById("cache-result").innerHTML='<span class="badge badge-success">删除成功</span>'}catch(e){document.getElementById("cache-result").innerHTML=`<span class="badge badge-danger">${e.message}</span>`}};window.__memCacheDemo=async()=>{const s=document.getElementById("cache-mem-result");if(!s)return;const e=new o;await e.set("user:1",{name:"Alice",age:30}),await e.set("user:2",{name:"Bob",age:25});const t=await e.get("user:1"),a=await e.has("user:2");s.innerHTML=`
        <div><span class="badge badge-info">new MemoryProvider()</span></div>
        <div class="mt-2">set('user:1', {name:'Alice'}) → <code style="color:#A855F7;">${JSON.stringify(t)}</code></div>
        <div>has('user:2') → <code style="color:#A855F7;">${a}</code></div>
    `};window.__cacheTTLSet=async()=>{const s=document.getElementById("cache-ttl-result");if(!s)return;await(await c.create("memory")).set("ttl-demo",{message:"我会过期"},3e3),s.innerHTML='<span class="badge badge-success">已写入 (TTL=3s)</span> <span class="text-muted">3秒后数据将过期</span>'};window.__cacheTTLGet=async()=>{const s=document.getElementById("cache-ttl-result");if(!s)return;const t=await(await c.create("memory")).get("ttl-demo");s.innerHTML=t?`<span class="badge badge-success">数据存在</span> <code style="color:#A855F7;">${JSON.stringify(t)}</code>`:'<span class="badge badge-warning">数据已过期</span>'};window.__cacheTTLGetAfter=async()=>{const s=document.getElementById("cache-ttl-result");s&&(s.innerHTML='<span class="badge badge-info">等待 3 秒...</span>',setTimeout(async()=>{const t=await(await c.create("memory")).get("ttl-demo"),a=document.getElementById("cache-ttl-result");a&&(a.innerHTML=t?`<span class="badge badge-success">数据仍存在</span> <code style="color:#A855F7;">${JSON.stringify(t)}</code>`:'<span class="badge badge-danger">数据已过期！</span> TTL 机制生效')},3500))};window.__cacheRelease=async()=>{const s=document.getElementById("cache-release-result");if(!s)return;const e=await c.create("memory");await e.set("release-demo",{data:"test"});const t=e.id;s.innerHTML=`
        <div><span class="badge badge-info">创建缓存实例</span> id: ${t}</div>
        <div class="mt-2">写入数据: release-demo</div>
    `,c.release(t),s.innerHTML+=`<div class="mt-2"><span class="badge badge-success">CacheFactory.release('${t}')</span> 已释放</div>`};export{F as renderCache};
