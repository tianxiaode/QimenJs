/**
 * 缓存系统页 - @orbitjs/cache
 */
import { CacheFactory, MemoryProvider } from '@orbitjs/cache';
import { renderPageContent } from '../layout';

export function renderCache(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>缓存系统</h2>
            <p>@orbitjs/cache — MemoryProvider + CacheFactory + TTL 过期机制</p>
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
                        <input id="cache-value" class="input" value='{"name":"OrbitJS","version":"2.0"}' placeholder="缓存值">
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
    `);
}

(window as any).__cacheSet = async () => {
    const key = (document.getElementById('cache-key') as HTMLInputElement).value;
    const value = (document.getElementById('cache-value') as HTMLInputElement).value;
    try {
        const provider = await CacheFactory.create('memory');
        await provider.set(key, JSON.parse(value));
        document.getElementById('cache-result')!.innerHTML = '<span class="badge badge-success">写入成功</span>';
    } catch (e: any) {
        document.getElementById('cache-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__cacheGet = async () => {
    const key = (document.getElementById('cache-key') as HTMLInputElement).value;
    try {
        const provider = await CacheFactory.create('memory');
        const data = await provider.get(key);
        document.getElementById('cache-result')!.innerHTML = data
            ? `<span class="badge badge-success">读取成功</span> <code class="text-muted">${JSON.stringify(data)}</code>`
            : '<span class="badge badge-warning">缓存不存在</span>';
    } catch (e: any) {
        document.getElementById('cache-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__cacheRemove = async () => {
    const key = (document.getElementById('cache-key') as HTMLInputElement).value;
    try {
        const provider = await CacheFactory.create('memory');
        await provider.remove(key);
        document.getElementById('cache-result')!.innerHTML = '<span class="badge badge-success">删除成功</span>';
    } catch (e: any) {
        document.getElementById('cache-result')!.innerHTML = `<span class="badge badge-danger">${e.message}</span>`;
    }
};

(window as any).__memCacheDemo = async () => {
    const el = document.getElementById('cache-mem-result');
    if (!el) return;
    const memCache = new MemoryProvider<string, any>();
    await memCache.set('user:1', { name: 'Alice', age: 30 });
    await memCache.set('user:2', { name: 'Bob', age: 25 });
    const user1 = await memCache.get('user:1');
    const hasUser2 = await memCache.has('user:2');
    el.innerHTML = `
        <div><span class="badge badge-info">new MemoryProvider()</span></div>
        <div class="mt-2">set('user:1', {name:'Alice'}) → <code style="color:#A855F7;">${JSON.stringify(user1)}</code></div>
        <div>has('user:2') → <code style="color:#A855F7;">${hasUser2}</code></div>
    `;
};

(window as any).__cacheTTLSet = async () => {
    const el = document.getElementById('cache-ttl-result');
    if (!el) return;
    const provider = await CacheFactory.create('memory');
    await provider.set('ttl-demo', { message: '我会过期' }, 3000);
    el.innerHTML = '<span class="badge badge-success">已写入 (TTL=3s)</span> <span class="text-muted">3秒后数据将过期</span>';
};

(window as any).__cacheTTLGet = async () => {
    const el = document.getElementById('cache-ttl-result');
    if (!el) return;
    const provider = await CacheFactory.create('memory');
    const data = await provider.get('ttl-demo');
    el.innerHTML = data
        ? `<span class="badge badge-success">数据存在</span> <code style="color:#A855F7;">${JSON.stringify(data)}</code>`
        : '<span class="badge badge-warning">数据已过期</span>';
};

(window as any).__cacheTTLGetAfter = async () => {
    const el = document.getElementById('cache-ttl-result');
    if (!el) return;
    el.innerHTML = '<span class="badge badge-info">等待 3 秒...</span>';
    setTimeout(async () => {
        const provider = await CacheFactory.create('memory');
        const data = await provider.get('ttl-demo');
        const el2 = document.getElementById('cache-ttl-result');
        if (el2) {
            el2.innerHTML = data
                ? `<span class="badge badge-success">数据仍存在</span> <code style="color:#A855F7;">${JSON.stringify(data)}</code>`
                : '<span class="badge badge-danger">数据已过期！</span> TTL 机制生效';
        }
    }, 3500);
};

(window as any).__cacheRelease = async () => {
    const el = document.getElementById('cache-release-result');
    if (!el) return;
    const provider = await CacheFactory.create('memory');
    await provider.set('release-demo', { data: 'test' });
    const id = provider.id;
    el.innerHTML = `
        <div><span class="badge badge-info">创建缓存实例</span> id: ${id}</div>
        <div class="mt-2">写入数据: release-demo</div>
    `;
    CacheFactory.release(id);
    el.innerHTML += `<div class="mt-2"><span class="badge badge-success">CacheFactory.release('${id}')</span> 已释放</div>`;
};
