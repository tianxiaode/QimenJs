/**
 * 登录页 - Linear Aesthetic 风格
 */
import { oauth2 } from '../config';
import { injectStyles } from '../layout';

// i18n 已通过 public/i18n.js 预加载
const i18n = (window as any).qimenI18n?.i18n;

export function showLoginPage(): void {
    injectStyles();

    const currentLang = i18n.locale || 'zh-CN';

    document.getElementById('app')!.innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <div style="position:absolute;top:16px;right:16px;">
                    <select id="login-lang" class="input" style="width:auto;padding:4px 8px;font-size:12px;" onchange="window.__changeLoginLang(this.value)">
                        <option value="zh-CN" ${currentLang === 'zh-CN' ? 'selected' : ''}>中文简体</option>
                        <option value="en-US" ${currentLang === 'en-US' ? 'selected' : ''}>English</option>
                        <option value="ja-JP" ${currentLang === 'ja-JP' ? 'selected' : ''}>日本語</option>
                    </select>
                </div>
                <h2>QimenJS</h2>
                <p class="subtitle">Enterprise Entity Framework</p>

                <div class="form-group">
                    <label>用户名</label>
                    <input id="username" class="input" type="text" value="admin" placeholder="输入用户名">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input id="password" class="input" type="password" value="123456" placeholder="输入密码">
                </div>
                <div id="login-error" style="margin-bottom: 12px;"></div>
                <button class="btn btn-primary w-full" onclick="window.__login()" style="justify-content: center; padding: 10px;">密码模式登录</button>

                <div class="login-divider">其他方式</div>

                <div class="flex gap-2">
                    <button class="btn btn-ghost" style="flex:1; justify-content:center;" onclick="window.__authorize()">授权码模式</button>
                    <button class="btn btn-ghost" style="flex:1; justify-content:center;" onclick="window.__clientCredentials()">客户端凭证</button>
                </div>

                <div class="login-footer">
                    测试账号：admin / 123456
                </div>
            </div>
        </div>
    `;
}

(window as any).__changeLoginLang = async (locale: string) => {
    await i18n.loadScript(`/locales/${locale}.js`);
    i18n.locale = locale;
    showLoginPage();
};

(window as any).__login = async () => {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const result = await oauth2.loginWithPassword({ username, password });
    if (result.success) {
        const { showApp } = await import('../main');
        showApp();
    } else {
        document.getElementById('login-error')!.innerHTML = `<div class="error-msg">${result.error?.message || '登录失败'}</div>`;
    }
};

(window as any).__authorize = () => {
    oauth2.authorize();
};

(window as any).__clientCredentials = async () => {
    const result = await oauth2.loginWithClientCredentials();
    if (result.success) {
        const { showApp } = await import('../main');
        showApp();
    } else {
        document.getElementById('login-error')!.innerHTML = `<div class="error-msg">${result.error?.message || '登录失败'}</div>`;
    }
};
