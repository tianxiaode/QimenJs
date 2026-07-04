/**
 * 模式匹配页 - @orbit-js/pattern
 */
import { PatternRegistrar, FORMAT_PATTERNS, PASSWORD_PATTERNS } from '@orbit-js/pattern';
import { renderPageContent } from '../layout';

export function renderPattern(): void {
    const formatEntries = Object.entries(FORMAT_PATTERNS);
    const passwordEntries = Object.entries(PASSWORD_PATTERNS);

    renderPageContent(`
        <div class="page-header">
            <h2>模式匹配</h2>
            <p>@orbit-js/pattern — PatternRegistrar 命名正则注册与验证</p>
        </div>

        <div class="section">
            <div class="section-title">交互式验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#6366F1;"></span>选择模式 + 测试字符串</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>选择模式</label>
                        <select id="pat-name" class="input">
                            ${[...formatEntries, ...passwordEntries].map(([name]) =>
                                `<option value="${name}">${name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>测试字符串</label>
                        <input id="pat-test" class="input" value="user@example.com" placeholder="输入测试字符串">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__testPattern()">验证</button>
                <div id="pat-test-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">自定义模式注册</div>
            <div class="card">
                <div class="grid-2">
                    <div class="form-group">
                        <label>模式名称</label>
                        <input id="pat-custom-name" class="input" value="productCode" placeholder="模式名称">
                    </div>
                    <div class="form-group">
                        <label>正则表达式</label>
                        <input id="pat-custom-regex" class="input" value="^[A-Z]{3}\\d{4}$" placeholder="正则表达式">
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.__registerCustomPattern()">注册</button>
                <div id="pat-custom-result" class="mt-3 text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">格式验证模式 (FORMAT_PATTERNS)</div>
            <div class="card">
                <div class="grid-3">
                    ${formatEntries.map(([name, regex]) =>
                        `<div class="text-xs" style="padding:4px 8px;cursor:pointer;" onclick="window.__selectPattern('${name}')">
                            <span class="badge badge-info">${name}</span>
                            <div class="text-muted mt-1" style="word-break:break-all;">${regex}</div>
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">密码验证模式 (PASSWORD_PATTERNS)</div>
            <div class="card">
                <div class="grid-2">
                    ${passwordEntries.map(([name, regex]) =>
                        `<div class="text-xs" style="padding:4px 8px;cursor:pointer;" onclick="window.__selectPattern('${name}')">
                            <span class="badge badge-warning">${name}</span>
                            <div class="text-muted mt-1" style="word-break:break-all;">${regex}</div>
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `);
}

(window as any).__testPattern = () => {
    const name = (document.getElementById('pat-name') as HTMLSelectElement).value;
    const testStr = (document.getElementById('pat-test') as HTMLInputElement).value;
    const el = document.getElementById('pat-test-result');
    if (!el) return;
    try {
        const registrar = PatternRegistrar.getInstance();
        const regex = registrar.get(name);
        const result = regex.test(testStr);
        el.innerHTML = `
            <div><span class="badge ${result ? 'badge-success' : 'badge-danger'}">${result ? '匹配成功' : '不匹配'}</span></div>
            <div class="mt-2 text-muted">模式: ${regex}</div>
            <div class="text-muted">输入: "${testStr}"</div>
        `;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">查询失败: ${err}</span>`;
    }
};

(window as any).__selectPattern = (name: string) => {
    const selectEl = document.getElementById('pat-name') as HTMLSelectElement;
    const testEl = document.getElementById('pat-test') as HTMLInputElement;
    if (selectEl) selectEl.value = name;
    if (testEl) testEl.focus();
};

(window as any).__registerCustomPattern = () => {
    const name = (document.getElementById('pat-custom-name') as HTMLInputElement).value;
    const regexStr = (document.getElementById('pat-custom-regex') as HTMLInputElement).value;
    const el = document.getElementById('pat-custom-result');
    if (!el || !name || !regexStr) return;
    try {
        const regex = new RegExp(regexStr);
        const registrar = PatternRegistrar.getInstance();
        registrar.register(name, regex);
        el.innerHTML = `<span class="badge badge-success">注册成功: ${name} → ${regexStr}</span>`;
    } catch (err) {
        el.innerHTML = `<span class="badge badge-danger">注册失败: ${err}</span>`;
    }
};
