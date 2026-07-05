/**
 * 异步工具页 - @qimenjs/async
 */
import { debounce, throttle } from '@qimen-lab/async';
import { renderPageContent } from '../layout';

let debounceCallCount = 0;
let throttleCallCount = 0;
let debounceTimeline: string[] = [];
let throttleTimeline: string[] = [];
let currentDebounce: ((...args: any[]) => void) & { cancel(): void } | null = null;

export function renderAsync(): void {
    debounceCallCount = 0;
    throttleCallCount = 0;
    debounceTimeline = [];
    throttleTimeline = [];

    renderPageContent(`
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
    `);
}

let totalThrottleClicks = 0;
let currentThrottle: ((...args: any[]) => void) | null = null;

(window as any).__debounceInput = () => {
    const wait = Number((document.getElementById('async-debounce-wait') as HTMLInputElement).value) || 500;
    const value = (document.getElementById('async-debounce-input') as HTMLInputElement).value;

    if (currentDebounce) currentDebounce.cancel();

    currentDebounce = debounce((val: string) => {
        debounceCallCount++;
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        debounceTimeline.push(`[${time}] 调用 #${debounceCallCount}: "${val}"`);
        const countEl = document.getElementById('async-debounce-count');
        if (countEl) countEl.textContent = String(debounceCallCount);
        const timelineEl = document.getElementById('async-debounce-timeline');
        if (timelineEl) timelineEl.innerHTML = debounceTimeline.map(t =>
            `<div style="color:#4CAF50;">${t}</div>`
        ).join('');
        if (timelineEl) timelineEl.scrollTop = timelineEl.scrollHeight;
    }, wait);

    currentDebounce(value);
};

(window as any).__resetDebounce = () => {
    debounceCallCount = 0;
    debounceTimeline = [];
    if (currentDebounce) currentDebounce.cancel();
    const countEl = document.getElementById('async-debounce-count');
    if (countEl) countEl.textContent = '0';
    const timelineEl = document.getElementById('async-debounce-timeline');
    if (timelineEl) timelineEl.innerHTML = '';
};

(window as any).__cancelDebounce = () => {
    if (currentDebounce) {
        currentDebounce.cancel();
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const timelineEl = document.getElementById('async-debounce-timeline');
        if (timelineEl) {
            debounceTimeline.push(`[${time}] <span style="color:#EF5350;">cancel() 已取消</span>`);
            timelineEl.innerHTML = debounceTimeline.map(t => `<div>${t}</div>`).join('');
        }
    }
};

(window as any).__throttleClick = () => {
    totalThrottleClicks++;
    const totalEl = document.getElementById('async-throttle-total');
    if (totalEl) totalEl.textContent = `总点击: ${totalThrottleClicks}`;

    const wait = Number((document.getElementById('async-throttle-wait') as HTMLInputElement).value) || 1000;

    if (!currentThrottle) {
        currentThrottle = throttle(() => {
            throttleCallCount++;
            const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
            throttleTimeline.push(`[${time}] 调用 #${throttleCallCount}`);
            const countEl = document.getElementById('async-throttle-count');
            if (countEl) countEl.textContent = String(throttleCallCount);
            const timelineEl = document.getElementById('async-throttle-timeline');
            if (timelineEl) timelineEl.innerHTML = throttleTimeline.map(t =>
                `<div style="color:#A855F7;">${t}</div>`
            ).join('');
            if (timelineEl) timelineEl.scrollTop = timelineEl.scrollHeight;
        }, wait);
    }

    currentThrottle();
};
