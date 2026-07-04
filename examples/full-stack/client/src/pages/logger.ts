/**
 * 日志系统页 - @orbit-js/logger
 */
import { Logger } from '@orbit-js/logger';
import { renderPageContent } from '../layout';

const logEntries: Array<{ level: string; category: string; message: string; time: string }> = [];

export function renderLogger(): void {
    logEntries.length = 0;

    renderPageContent(`
        <div class="page-header">
            <h2>日志系统</h2>
            <p>@orbit-js/logger — Logger.for() 子记录器 + 四级日志 + 格式化输出</p>
        </div>

        <div class="section">
            <div class="section-title">日志级别说明</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>级别</th><th>用途</th><th>颜色</th></tr></thead>
                    <tbody>
                        <tr><td><span class="badge badge-info">debug</span></td><td>调试信息，仅开发环境</td><td style="color:#888;">灰色</td></tr>
                        <tr><td><span class="badge badge-success">info</span></td><td>常规运行信息</td><td style="color:#4CAF50;">绿色</td></tr>
                        <tr><td><span class="badge badge-warning">warn</span></td><td>警告，不影响运行</td><td style="color:#FF9800;">橙色</td></tr>
                        <tr><td><span class="badge badge-danger">error</span></td><td>错误，需要关注</td><td style="color:#EF5350;">红色</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">交互式日志输出</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>发送日志</div>
                    <div class="form-group">
                        <label>分类名</label>
                        <input id="log-category" class="input" value="UserService" placeholder="输入分类名">
                    </div>
                    <div class="form-group">
                        <label>日志消息</label>
                        <input id="log-message" class="input" value="用户登录成功" placeholder="输入日志消息">
                    </div>
                    <div class="form-group">
                        <label>日志级别</label>
                        <select id="log-level" class="input">
                            <option value="debug">debug</option>
                            <option value="info" selected>info</option>
                            <option value="warn">warn</option>
                            <option value="error">error</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__sendLog()">发送</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__clearLog()" style="margin-left:8px;">清空</button>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>Logger.for() 子记录器</div>
                    <p class="text-sm text-muted mb-3">使用 Logger.for() 创建带分类名的子记录器</p>
                    <div class="form-group">
                        <label>子记录器分类</label>
                        <input id="log-child-category" class="input" value="DataProcessor" placeholder="输入分类名">
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.__sendChildLog()">使用子记录器发送 info</button>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">日志流</div>
            <div class="card">
                <div id="log-stream" style="max-height:400px;overflow-y:auto;font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;">
                    <div class="text-muted">等待日志输出...</div>
                </div>
            </div>
        </div>
    `);
}

function appendLog(level: string, category: string, message: string): void {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    logEntries.push({ level, category, message, time });
    updateLogStream();
}

function updateLogStream(): void {
    const el = document.getElementById('log-stream');
    if (!el) return;
    const colors: Record<string, string> = { debug: '#888', info: '#4CAF50', warn: '#FF9800', error: '#EF5350' };
    el.innerHTML = logEntries.map(e => {
        const color = colors[e.level] || '#888';
        return `<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:#666;">${e.time}</span>
            <span style="color:${color};font-weight:bold;margin:0 8px;">[${e.level.toUpperCase()}]</span>
            <span style="color:#6366F1;">[${e.category}]</span>
            <span style="color:#ccc;margin-left:8px;">${e.message}</span>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

(window as any).__sendLog = () => {
    const category = (document.getElementById('log-category') as HTMLInputElement).value || 'App';
    const message = (document.getElementById('log-message') as HTMLInputElement).value;
    const level = (document.getElementById('log-level') as HTMLSelectElement).value as any;

    const logger = Logger.for(category);
    switch (level) {
        case 'debug': logger.debug(message); break;
        case 'info': logger.info(message); break;
        case 'warn': logger.warn(message); break;
        case 'error': logger.error(new Error(message)); break;
    }
    appendLog(level, category, message);
};

(window as any).__sendChildLog = () => {
    const category = (document.getElementById('log-child-category') as HTMLInputElement).value || 'Child';
    const logger = Logger.for(category);
    const message = `来自 ${category} 子记录器的日志`;
    logger.info(message);
    appendLog('info', category, message);
};

(window as any).__clearLog = () => {
    logEntries.length = 0;
    updateLogStream();
};
