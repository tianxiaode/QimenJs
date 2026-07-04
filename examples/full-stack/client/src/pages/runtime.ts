/**
 * 运行时检测页 - @orbitjs/runtime
 */
import {
    getRuntimeEnv,
    getPlatform,
    getLocale,
    getTimezone,
    getUserAgent,
    runtimeFeatures,
    isTouchDevice,
    detectInputCapabilities,
    MemoryManager,
} from '@orbitjs/runtime';
import { renderPageContent } from '../layout';

export function renderRuntime(): void {
    const env = getRuntimeEnv();
    const platform = getPlatform();
    const locale = getLocale();
    const timezone = getTimezone();
    const ua = getUserAgent();
    const touch = isTouchDevice();
    const inputCaps = detectInputCapabilities();

    // 特性检测
    const features: Record<string, boolean> = {};
    if (runtimeFeatures && typeof runtimeFeatures === 'object') {
        Object.entries(runtimeFeatures).forEach(([k, v]) => {
            if (typeof v === 'boolean') features[k] = v;
        });
    }

    renderPageContent(`
        <div class="page-header">
            <h2>运行时检测</h2>
            <p>@orbitjs/runtime — 浏览器/Node.js 环境检测 + 特性探测</p>
        </div>

        <div class="section">
            <div class="section-title">环境信息</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>运行环境</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">运行时</td><td>${env || 'browser'}</td></tr>
                            <tr><td class="text-muted">平台</td><td>${platform || 'unknown'}</td></tr>
                            <tr><td class="text-muted">语言</td><td>${locale || navigator.language}</td></tr>
                            <tr><td class="text-muted">时区</td><td>${timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</td></tr>
                            <tr><td class="text-muted">UserAgent</td><td style="word-break:break-all;font-size:12px;">${ua || navigator.userAgent}</td></tr>
                            <tr><td class="text-muted">触摸设备</td><td>${touch ? '<span class="badge badge-success">是</span>' : '<span class="badge badge-danger">否</span>'}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>输入能力</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">触摸</td><td>${inputCaps?.touch ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">鼠标</td><td>${inputCaps?.mouse ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">键盘</td><td>${inputCaps?.keyboard ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">手写笔</td><td>${inputCaps?.pen ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
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
                            ${Object.keys(features).length > 0
                                ? Object.entries(features).map(([k, v]) =>
                                    `<tr><td class="text-muted">${k}</td><td>${v ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>`
                                  ).join('')
                                : '<tr><td colspan="2" class="text-muted">无特性标记</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#F59E0B;"></span>浏览器 API</div>
                    <table class="data-table">
                        <tbody>
                            <tr><td class="text-muted">ServiceWorker</td><td>${'serviceWorker' in navigator ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebSocket</td><td>${'WebSocket' in window ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">IndexedDB</td><td>${'indexedDB' in window ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebGL</td><td>${checkWebGL() ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">WebRTC</td><td>${'RTCPeerConnection' in window ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
                            <tr><td class="text-muted">Notification</td><td>${'Notification' in window ? '<span class="badge badge-success">支持</span>' : '<span class="badge badge-danger">不支持</span>'}</td></tr>
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
                        <tr><td class="text-muted">内存（JS Heap）</td><td>${formatMemory()}</td></tr>
                        <tr><td class="text-muted">CPU 核心数</td><td>${navigator.hardwareConcurrency || 'N/A'}</td></tr>
                        <tr><td class="text-muted">网络类型</td><td>${(navigator as any).connection?.effectiveType || 'N/A'}</td></tr>
                        <tr><td class="text-muted">在线状态</td><td>${navigator.onLine ? '<span class="badge badge-success">在线</span>' : '<span class="badge badge-danger">离线</span>'}</td></tr>
                        <tr><td class="text-muted">Cookie 启用</td><td>${navigator.cookieEnabled ? '<span class="badge badge-success">是</span>' : '<span class="badge badge-danger">否</span>'}</td></tr>
                        <tr><td class="text-muted">屏幕</td><td>${screen.width}×${screen.height} @${window.devicePixelRatio}x</td></tr>
                        <tr><td class="text-muted">视口</td><td>${window.innerWidth}×${window.innerHeight}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">MemoryManager</div>
            <div class="card">
                <p class="text-sm text-muted" style="margin-bottom:12px;">@orbitjs/runtime 提供的内存管理器，支持内存快照、阈值监控和票据机制。</p>
                <table class="data-table">
                    <tbody>
                        <tr><td class="text-muted">MemoryManager</td><td>内存管理器类，提供 snapshot() / watch() / ticket() 等方法</td></tr>
                        <tr><td class="text-muted">MemoryTicket</td><td>内存票据类，用于申请和释放内存配额</td></tr>
                        <tr><td class="text-muted">MemorySnapshot</td><td>内存快照接口，记录 used / total / limit 等信息</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

function checkWebGL(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch { return false; }
}

function formatMemory(): string {
    const perf = performance as any;
    if (perf.memory) {
        const used = (perf.memory.usedJSHeapSize / 1048576).toFixed(1);
        const total = (perf.memory.totalJSHeapSize / 1048576).toFixed(1);
        return `${used} MB / ${total} MB`;
    }
    return 'N/A（仅 Chrome 支持）';
}
