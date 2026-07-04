/**
 * 登录页 - Linear Aesthetic 风格
 */
import { oauth2 } from '../config';
import { injectStyles } from '../layout';

export function showLoginPage(): void {
    injectStyles();

    document.getElementById('app')!.innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <h2>OrbitJS</h2>
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
