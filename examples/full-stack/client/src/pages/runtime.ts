/**
 * 运行时检测页 - @orbitjs/runtime
 */
import { RuntimeDetector } from '@orbitjs/runtime';
import { renderPageContent } from '../layout';

export function renderRuntime(): void {
    const detector = RuntimeDetector.getInstance();
    const info = detector.detect();

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
                            <tr><td class="text-muted">平台</td><td>${info.platform || 'browser'}</td></tr>
                            <tr><td class="text-muted">浏览器</td><td>${info.browser?.name || navigator.userAgent.split(' ').pop() || 'Unknown'}</td></tr>
                            <tr><td class="text-muted">语言</td><td>${navigator.language}</td></tr>
                            <tr><td class="text-muted">屏幕</td><td>${screen.width}×${screen.height}</td></tr>
                            <tr><td class="text-muted">视口</td><td>${window.innerWidth}×${window.innerHeight}</td></tr>
                            <tr><td class="text-muted">DPR</td><td>${window.devicePixelRatio}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>特性支持</div>
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
