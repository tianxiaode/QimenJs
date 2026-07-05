/**
 * 任务调度页 - @qimenjs/task
 */
import { globalTaskQueue } from '@qimen-lab/task';
import { renderPageContent } from '../layout';

const taskLog: Array<{ time: string; msg: string; type: string }> = [];

export function renderTask(): void {
    taskLog.length = 0;

    renderPageContent(`
        <div class="page-header">
            <h2>任务调度</h2>
            <p>@qimenjs/task — GlobalTaskQueue 优先级调度</p>
        </div>

        <div class="section">
            <div class="section-title">任务队列架构</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>特性</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>优先级</td><td>HIGH / NORMAL / LOW，高优先级先执行</td></tr>
                        <tr><td>并发控制</td><td>默认最大 5 个并发任务</td></tr>
                        <tr><td>重试机制</td><td>失败自动重试，默认 3 次</td></tr>
                        <tr><td>延迟执行</td><td>支持 delay 参数延迟启动</td></tr>
                        <tr><td>轮询任务</td><td>支持 isPolling + interval 定时执行</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">添加任务</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>添加优先级任务</div>
                    <div class="form-group">
                        <label>任务名称</label>
                        <input id="task-name" class="input" value="数据加载任务" placeholder="输入任务名">
                    </div>
                    <div class="form-group">
                        <label>优先级</label>
                        <select id="task-priority" class="input">
                            <option value="HIGH">HIGH - 高优先级</option>
                            <option value="NORMAL" selected>NORMAL - 普通</option>
                            <option value="LOW">LOW - 低优先级</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>模拟耗时 (ms)</label>
                        <input id="task-duration" class="input" type="number" value="1000" min="100" max="5000">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__addTask()">添加任务</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>批量添加</div>
                    <p class="text-sm text-muted mb-3">快速添加多个不同优先级的任务，观察执行顺序</p>
                    <button class="btn btn-primary btn-sm" onclick="window.__addBatchTasks()">添加 3 个任务 (LOW/NORMAL/HIGH)</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">哈希任务（Node.js 专属）</div>
            <div class="card">
                <p class="text-sm text-muted">HashTask 子模块依赖 Node.js worker_threads，仅在后端环境可用。浏览器端可使用 GlobalTaskQueue 进行任务调度。</p>
                <table class="data-table">
                    <thead><tr><th>子模块</th><th>环境</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>task/</td><td>浏览器 + Node.js</td><td>GlobalTaskQueue 优先级调度</td></tr>
                        <tr><td>worker/</td><td>浏览器 + Node.js</td><td>Web Worker 管理器</td></tr>
                        <tr><td>hash-task/</td><td>Node.js 专属</td><td>文件哈希计算（依赖 worker_threads）</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">任务执行日志</div>
            <div class="card">
                <button class="btn btn-ghost btn-sm mb-3" onclick="window.__clearTaskLog()">清空日志</button>
                <div id="task-log" style="max-height:300px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待任务...</div>
                </div>
            </div>
        </div>
    `);
}

function addTaskLog(msg: string, type: string = 'info'): void {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    taskLog.push({ time, msg, type });
    updateTaskLog();
}

function updateTaskLog(): void {
    const el = document.getElementById('task-log');
    if (!el) return;
    const colors: Record<string, string> = { info: '#4CAF50', high: '#EF5350', normal: '#6366F1', low: '#888', error: '#EF5350', success: '#4CAF50' };
    el.innerHTML = taskLog.map(e => {
        const color = colors[e.type] || '#888';
        return `<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:${color};margin-left:8px;">${e.msg}</span>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

(window as any).__addTask = () => {
    const name = (document.getElementById('task-name') as HTMLInputElement).value;
    const priority = (document.getElementById('task-priority') as HTMLSelectElement).value as any;
    const duration = Number((document.getElementById('task-duration') as HTMLInputElement).value) || 1000;

    addTaskLog(`添加任务: "${name}" [${priority}] 耗时 ${duration}ms`, priority.toLowerCase());

    globalTaskQueue.addTask(
        async () => {
            addTaskLog(`开始执行: "${name}"`, 'info');
            await new Promise(resolve => setTimeout(resolve, duration));
            addTaskLog(`完成: "${name}"`, 'success');
        },
        priority,
        1,
        0
    );
};

(window as any).__addBatchTasks = () => {
    const tasks = [
        { name: '低优先级任务', priority: 'LOW' as const, duration: 800 },
        { name: '普通优先级任务', priority: 'NORMAL' as const, duration: 600 },
        { name: '高优先级任务', priority: 'HIGH' as const, duration: 400 },
    ];

    for (const t of tasks) {
        addTaskLog(`添加任务: "${t.name}" [${t.priority}]`, t.priority.toLowerCase());
        globalTaskQueue.addTask(
            async () => {
                addTaskLog(`开始执行: "${t.name}"`, 'info');
                await new Promise(resolve => setTimeout(resolve, t.duration));
                addTaskLog(`完成: "${t.name}"`, 'success');
            },
            t.priority,
            1,
            0
        );
    }
};

(window as any).__clearTaskLog = () => {
    taskLog.length = 0;
    updateTaskLog();
};
