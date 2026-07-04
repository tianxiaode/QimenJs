/**
 * 错误处理页 - @qimenjs/error
 */
import { ErrorBase, KernelError, GestureError, KernelErrorCode } from '@qimenjs/error';
import { renderPageContent } from '../layout';

export function renderError(): void {
    const codeEntries = Object.entries(KernelErrorCode);

    renderPageContent(`
        <div class="page-header">
            <h2>错误处理</h2>
            <p>@qimenjs/error — ErrorBase / KernelError / GestureError + 错误码体系</p>
        </div>

        <div class="section">
            <div class="section-title">错误类型对比</div>
            <div class="card">
                <table class="data-table">
                    <thead>
                        <tr><th>类型</th><th>继承</th><th>用途</th><th>特有属性</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">ErrorBase</span></td><td>Error</td><td>基础错误抽象类</td><td>code, timestamp, context</td></tr>
                        <tr><td><span class="badge badge-purple">KernelError</span></td><td>ErrorBase</td><td>内核模块错误</td><td>KernelErrorCode</td></tr>
                        <tr><td><span class="badge badge-warning">GestureError</span></td><td>KernelError</td><td>手势事件错误</td><td>手势上下文</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式错误创建</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>创建 KernelError</div>
                    <div class="form-group">
                        <label>错误消息</label>
                        <input id="err-kernel-msg" class="input" value="操作失败" placeholder="输入错误消息">
                    </div>
                    <div class="form-group">
                        <label>错误码</label>
                        <select id="err-kernel-code" class="input">
                            ${codeEntries.map(([name, val]) => `<option value="${val}">${name}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__createKernelError()">创建错误</button>
                    <div id="err-kernel-result" class="mt-3 text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>创建 GestureError</div>
                    <div class="form-group">
                        <label>错误消息</label>
                        <input id="err-gesture-msg" class="input" value="手势识别失败" placeholder="输入错误消息">
                    </div>
                    <div class="form-group">
                        <label>错误码</label>
                        <select id="err-gesture-code" class="input">
                            <option value="GESTURE_RECOGNITION_ERROR">GESTURE_RECOGNITION_ERROR</option>
                            <option value="GESTURE_DISTANCE_INSUFFICIENT">GESTURE_DISTANCE_INSUFFICIENT</option>
                            <option value="UNKNOWN_GESTURE_PROCESSOR">UNKNOWN_GESTURE_PROCESSOR</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__createGestureError()">创建错误</button>
                    <div id="err-gesture-result" class="mt-3 text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">错误链追踪</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#EF5350;"></span>嵌套 cause 链</div>
                <button class="btn btn-primary btn-sm" onclick="window.__createErrorChain()">创建错误链</button>
                <div id="err-chain-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">错误码一览</div>
            <div class="card">
                <div class="grid-3">
                    ${codeEntries.map(([name]) => `<div class="text-sm" style="padding:4px 8px;"><span class="badge badge-muted">${name}</span></div>`).join('')}
                </div>
            </div>
        </div>
    `);
}

function formatError(err: Error): string {
    const obj: Record<string, any> = {
        name: err.name,
        message: err.message,
    };
    if ('code' in err) obj.code = (err as any).code;
    if ('timestamp' in err) obj.timestamp = (err as any).timestamp?.toISOString();
    if ('context' in err && (err as any).context) obj.context = (err as any).context;
    if (err.cause) obj.cause = formatError(err.cause as Error);
    return JSON.stringify(obj, null, 2);
}

(window as any).__createKernelError = () => {
    const msg = (document.getElementById('err-kernel-msg') as HTMLInputElement).value;
    const code = (document.getElementById('err-kernel-code') as HTMLSelectElement).value;
    const error = new KernelError(msg, code as KernelErrorCode, { source: 'demo-app' });
    const el = document.getElementById('err-kernel-result');
    if (el) el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${formatError(error)}</pre>`;
};

(window as any).__createGestureError = () => {
    const msg = (document.getElementById('err-gesture-msg') as HTMLInputElement).value;
    const code = (document.getElementById('err-gesture-code') as HTMLSelectElement).value;
    const error = new GestureError(msg, code as KernelErrorCode, {
        gestureType: 'swipe',
        position: { x: 100, y: 200 },
    });
    const el = document.getElementById('err-gesture-result');
    if (el) el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${formatError(error)}</pre>`;
};

(window as any).__createErrorChain = () => {
    const rootCause = new KernelError('数据库连接超时', KernelErrorCode.ENTITY_FETCH_TIMEOUT, { host: 'db.example.com', port: 5432 });
    const midError = new KernelError('实体获取失败', KernelErrorCode.ENTITY_FETCH_FAILED, { entity: 'User' });
    (midError as any).cause = rootCause;
    const topError = new KernelError('操作失败', KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS, { action: 'loadUsers' });
    (topError as any).cause = midError;

    const el = document.getElementById('err-chain-result');
    if (el) el.innerHTML = `<pre style="background:#0A0A0B;padding:12px;border-radius:6px;overflow:auto;font-size:12px;">${formatError(topError)}</pre>`;
};
