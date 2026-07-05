/**
 * DOM 事件页 - @qimenjs/event-dom
 */
import { createEventAdapter } from '@qimen-lab/event-dom';
import { EventBus } from '@qimen-lab/events';
import { renderPageContent } from '../layout';

const gestureLog: Array<{ time: string; gesture: string; detail: string }> = [];

export function renderEventDom(): void {
    gestureLog.length = 0;

    renderPageContent(`
        <div class="page-header">
            <h2>DOM 事件</h2>
            <p>@qimenjs/event-dom — DomEventAdapter 手势识别 + 事件绑定</p>
        </div>

        <div class="section">
            <div class="section-title">手势语义列表</div>
            <div class="card">
                <div class="grid-3">
                    ${['tap', 'doubletap', 'longpress', 'swipe', 'swipeleft', 'swiperight', 'swipeup', 'swipedown', 'pinch', 'rotate'].map(g =>
                        `<div class="text-xs" style="padding:4px 8px;"><span class="badge badge-info">${g}</span></div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">手势演示区域</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>在此区域触发手势</div>
                <p class="text-sm text-muted mb-3">点击、双击、长按、滑动等操作将被识别</p>
                <div id="event-dom-area" style="min-height:200px;background:#0A0A0B;border:2px dashed rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;">
                    <span class="text-muted">在此区域操作...</span>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary btn-sm" onclick="window.__bindTap()">绑定 tap</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__bindLongpress()">绑定 longpress</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__unbindAll()">解绑全部</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">绑定选项</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>选项</th><th>类型</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td><code>debounce</code></td><td>number</td><td>防抖时间 (ms)</td></tr>
                        <tr><td><code>throttle</code></td><td>number</td><td>节流时间 (ms)</td></tr>
                        <tr><td><code>preventDefault</code></td><td>boolean</td><td>阻止默认行为</td></tr>
                        <tr><td><code>stopPropagation</code></td><td>boolean</td><td>阻止事件冒泡</td></tr>
                        <tr><td><code>selector</code></td><td>string</td><td>子元素选择器委托</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">手势识别日志</div>
            <div class="card">
                <button class="btn btn-ghost btn-sm mb-3" onclick="window.__clearGestureLog()">清空日志</button>
                <div id="event-dom-log" style="max-height:200px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待手势...</div>
                </div>
            </div>
        </div>
    `);
}

function addGestureLog(gesture: string, detail: string): void {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    gestureLog.push({ time, gesture, detail });
    const el = document.getElementById('event-dom-log');
    if (!el) return;
    el.innerHTML = gestureLog.map(e =>
        `<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:#6366F1;font-weight:bold;margin:0 8px;">[${e.gesture}]</span>
            <span style="color:#A855F7;">${e.detail}</span>
        </div>`
    ).join('');
    el.scrollTop = el.scrollHeight;
}

const unbindFns: Array<() => void> = [];

(window as any).__bindTap = () => {
    const area = document.getElementById('event-dom-area');
    if (!area) return;
    try {
        const bus = new EventBus();
        const scope = bus.createScope();
        const adapter = createEventAdapter();
        const unbind = adapter.bind(area, 'tap', scope, {});
        unbindFns.push(unbind);
        addGestureLog('tap', '已绑定 tap 手势');
        area.querySelector('span')!.textContent = '点击此区域触发 tap';
    } catch (err) {
        addGestureLog('error', `绑定失败: ${err}`);
    }
};

(window as any).__bindLongpress = () => {
    const area = document.getElementById('event-dom-area');
    if (!area) return;
    try {
        const bus = new EventBus();
        const scope = bus.createScope();
        const adapter = createEventAdapter();
        const unbind = adapter.bind(area, 'longpress', scope, {});
        unbindFns.push(unbind);
        addGestureLog('longpress', '已绑定 longpress 手势');
    } catch (err) {
        addGestureLog('error', `绑定失败: ${err}`);
    }
};

(window as any).__unbindAll = () => {
    unbindFns.forEach(fn => fn());
    unbindFns.length = 0;
    addGestureLog('unbind', '已解绑全部手势');
    const area = document.getElementById('event-dom-area');
    if (area) area.querySelector('span')!.textContent = '在此区域操作...';
};

(window as any).__clearGestureLog = () => {
    gestureLog.length = 0;
    const el = document.getElementById('event-dom-log');
    if (el) el.innerHTML = '<div class="text-muted">等待手势...</div>';
};
