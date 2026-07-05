/**
 * 事件总线页 - @qimenjs/events
 */
import { EventBus, EventScope, globalEventBus } from '@qimen-lab/core/events';
import { renderPageContent } from '../layout';

const eventLog: Array<{ time: string; type: string; event: string; data: string }> = [];
let localBus: EventBus | null = null;
let localScope: EventScope | null = null;

export function renderEvents(): void {
    eventLog.length = 0;
    localBus = new EventBus();
    localScope = localBus.createScope() as EventScope;

    renderPageContent(`
        <div class="page-header">
            <h2>事件总线</h2>
            <p>@qimenjs/events — EventBus / EventScope / globalEventBus</p>
        </div>

        <div class="section">
            <div class="section-title">架构说明</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>组件</th><th>职责</th><th>生命周期</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">EventBus</span></td><td>事件订阅/发布核心</td><td>手动管理</td></tr>
                        <tr><td><span class="badge badge-purple">EventScope</span></td><td>作用域隔离，自动清理</td><td>dispose() 自动解绑</td></tr>
                        <tr><td><span class="badge badge-success">globalEventBus</span></td><td>全局单例事件总线</td><td>应用级</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式事件操作</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>订阅事件 (on)</div>
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="evt-name" class="input" value="user:login" placeholder="输入事件名">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__subscribeEvent()">订阅</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__subscribeOnce()" style="margin-left:8px;">once 订阅</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>发布事件 (emit)</div>
                    <div class="form-group">
                        <label>事件名</label>
                        <input id="evt-emit-name" class="input" value="user:login" placeholder="输入事件名">
                    </div>
                    <div class="form-group">
                        <label>数据 (JSON)</label>
                        <input id="evt-emit-data" class="input" value='{"userId":"123"}' placeholder="JSON 数据">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__emitEvent()">发布</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">作用域管理</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>EventScope 自动清理</div>
                <p class="text-sm text-muted mb-3">创建作用域后订阅的事件，在 dispose() 时自动全部解绑</p>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="window.__scopeSubscribe()">作用域订阅</button>
                    <button class="btn btn-danger btn-sm" onclick="window.__scopeDispose()">dispose() 销毁</button>
                </div>
                <div id="evt-scope-status" class="mt-2 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">事件流日志</div>
            <div class="card">
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__clearEventLog()">清空日志</button>
                </div>
                <div id="evt-log" style="max-height:300px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待事件...</div>
                </div>
            </div>
        </div>
    `);
}

function addLog(type: string, event: string, data: string): void {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    eventLog.push({ time, type, event, data });
    updateLog();
}

function updateLog(): void {
    const el = document.getElementById('evt-log');
    if (!el) return;
    const colors: Record<string, string> = { subscribe: '#4CAF50', emit: '#6366F1', receive: '#A855F7', dispose: '#EF5350', once: '#FF9800' };
    el.innerHTML = eventLog.map(e => {
        const color = colors[e.type] || '#888';
        return `<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:${color};font-weight:bold;margin:0 8px;">[${e.type.toUpperCase()}]</span>
            <span style="color:#6366F1;">${e.event}</span>
            <span style="color:#888;margin-left:8px;">${e.data}</span>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

(window as any).__subscribeEvent = () => {
    const name = (document.getElementById('evt-name') as HTMLInputElement).value;
    if (!localBus) return;
    const unsub = localBus.on(name, (ctx: any) => {
        addLog('receive', name, JSON.stringify(ctx.data));
    });
    addLog('subscribe', name, 'on() - 持续订阅');
};

(window as any).__subscribeOnce = () => {
    const name = (document.getElementById('evt-name') as HTMLInputElement).value;
    if (!localBus) return;
    localBus.once(name, (ctx: any) => {
        addLog('receive', name, 'once() - 一次性触发');
    });
    addLog('once', name, 'once() - 一次性订阅');
};

(window as any).__emitEvent = () => {
    const name = (document.getElementById('evt-emit-name') as HTMLInputElement).value;
    const dataStr = (document.getElementById('evt-emit-data') as HTMLInputElement).value;
    if (!localBus) return;
    let data: any;
    try { data = JSON.parse(dataStr); } catch { data = dataStr; }
    localBus.emit(name, data);
    addLog('emit', name, JSON.stringify(data));
};

(window as any).__scopeSubscribe = () => {
    if (!localScope) return;
    localScope.on('scope:event', (ctx: any) => {
        addLog('receive', 'scope:event', JSON.stringify(ctx.data));
    });
    addLog('subscribe', 'scope:event', '作用域订阅');
    const el = document.getElementById('evt-scope-status');
    if (el) el.innerHTML = '<span class="badge badge-success">作用域活跃 - 已订阅 scope:event</span>';
};

(window as any).__scopeDispose = () => {
    if (localScope) {
        localScope.dispose();
        addLog('dispose', 'scope:event', '作用域已销毁，所有订阅自动解绑');
    }
    const el = document.getElementById('evt-scope-status');
    if (el) el.innerHTML = '<span class="badge badge-danger">作用域已销毁</span>';
};

(window as any).__clearEventLog = () => {
    eventLog.length = 0;
    updateLog();
};
