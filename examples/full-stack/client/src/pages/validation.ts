/**
 * 表单验证页 - @orbitjs/validation
 */
import { validate, doValidate } from '@orbitjs/validation';
import { renderPageContent } from '../layout';

export function renderValidation(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>表单验证</h2>
            <p>@orbitjs/validation — 11 类处理器 + 自定义规则 + 错误收集</p>
        </div>

        <div class="section">
            <div class="section-title">字符串验证</div>
            <div class="grid-2">
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#6366F1;"></span>必填 + 长度限制</div>
                    <div class="form-group">
                        <label>用户名（3-20 字符）</label>
                        <input id="v-username" class="input" placeholder="输入用户名" oninput="window.__validateString()">
                    </div>
                    <div id="v-username-result" class="text-sm"></div>
                </div>
                <div class="card">
                    <div class="card-title"><span class="dot" style="background:#A855F7;"></span>邮箱格式</div>
                    <div class="form-group">
                        <label>邮箱地址</label>
                        <input id="v-email" class="input" placeholder="输入邮箱" oninput="window.__validateEmail()">
                    </div>
                    <div id="v-email-result" class="text-sm"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">数字验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#4CAF50;"></span>范围约束</div>
                <div class="form-group">
                    <label>年龄（18-120）</label>
                    <input id="v-age" class="input" type="number" placeholder="输入年龄" oninput="window.__validateNumber()">
                </div>
                <div id="v-age-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">密码验证</div>
            <div class="card">
                <div class="card-title"><span class="dot" style="background:#EF5350;"></span>强度规则</div>
                <div class="form-group">
                    <label>密码（8-32 位，需含大小写+数字+特殊字符）</label>
                    <input id="v-password" class="input" type="password" placeholder="输入密码" oninput="window.__validatePassword()">
                </div>
                <div id="v-password-result" class="text-sm"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">批量验证</div>
            <div class="card">
                <button class="btn btn-primary btn-sm" onclick="window.__validateAll()">验证全部</button>
                <div id="v-all-result" class="mt-3"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">API 一览</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>方法</th><th>说明</th><th>返回值</th></tr></thead>
                    <tbody>
                        <tr><td><code>doValidate(value, rule)</code></td><td>核心验证函数</td><td>ValidationResult { isValid, errors, ... }</td></tr>
                        <tr><td><code>validate.validate(value, rule)</code></td><td>通用语法糖</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.string(value, rule)</code></td><td>字符串验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.number(value, rule)</code></td><td>数字验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.email(value, rule)</code></td><td>邮箱验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>validate.password(value, rule)</code></td><td>密码验证</td><td>IValidationError[] | null</td></tr>
                        <tr><td><code>assert.string(value, rule)</code></td><td>断言式验证（失败抛异常）</td><td>void</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

function showResult(elementId: string, result: { isValid: boolean; errors: any[] }): void {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (result.isValid) {
        el.innerHTML = '<span class="badge badge-success">✓ 通过</span>';
    } else {
        el.innerHTML = result.errors.map((e: any) => `<span class="badge badge-danger" style="margin:2px;">${e.code}</span>`).join(' ');
    }
}

(window as any).__validateString = async () => {
    const value = (document.getElementById('v-username') as HTMLInputElement).value;
    const result = await doValidate(value, { type: 'string', required: true, minLength: 3, maxLength: 20 });
    showResult('v-username-result', result);
};

(window as any).__validateEmail = async () => {
    const value = (document.getElementById('v-email') as HTMLInputElement).value;
    const result = await doValidate(value, { type: 'string', required: true, format: 'email' });
    showResult('v-email-result', result);
};

(window as any).__validateNumber = async () => {
    const value = Number((document.getElementById('v-age') as HTMLInputElement).value);
    const result = await doValidate(value, { type: 'number', required: true, min: 18, max: 120 });
    showResult('v-age-result', result);
};

(window as any).__validatePassword = async () => {
    const value = (document.getElementById('v-password') as HTMLInputElement).value;
    const result = await doValidate(value, { type: 'password' });
    showResult('v-password-result', result);
};

(window as any).__validateAll = async () => {
    const el = document.getElementById('v-all-result');
    if (!el) return;

    const tests = [
        { label: '空字符串 required', value: '', rule: { type: 'string', required: true } },
        { label: '短字符串 min', value: 'ab', rule: { type: 'string', minLength: 3 } },
        { label: '有效邮箱', value: 'test@example.com', rule: { type: 'string', format: 'email' } },
        { label: '无效邮箱', value: 'not-email', rule: { type: 'string', format: 'email' } },
        { label: '数字范围 OK', value: 25, rule: { type: 'number', min: 18, max: 120 } },
        { label: '数字范围 NG', value: 5, rule: { type: 'number', min: 18, max: 120 } },
    ];

    let html = '';
    for (const test of tests) {
        const result = await doValidate(test.value, test.rule);
        html += `<div class="flex items-center gap-2 mb-2">
            <span class="badge ${result.isValid ? 'badge-success' : 'badge-danger'}">${result.isValid ? '✓' : '✗'}</span>
            <span class="text-sm">${test.label}</span>
            <span class="text-muted text-xs">value: ${JSON.stringify(test.value)}</span>
        </div>`;
    }
    el.innerHTML = html;
};
