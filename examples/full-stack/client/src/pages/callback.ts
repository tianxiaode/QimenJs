/**
 * OAuth2 授权码回调页
 */
import { oauth2 } from '../config';
import { injectStyles } from '../layout';

export async function handleCallback(): Promise<void> {
    injectStyles();

    const app = document.getElementById('app')!;
    app.innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <h2>授权回调中...</h2>
                <p class="subtitle">正在处理 OAuth2 授权码</p>
                <div class="loading-skeleton" style="height:16px;width:200px;margin:16px auto;"></div>
            </div>
        </div>
    `;

    try {
        const result = await oauth2.handleCallback();
        if (result.success) {
            const { showApp } = await import('../main');
            showApp();
        } else {
            app.innerHTML = `
                <div class="login-page">
                    <div class="login-card">
                        <h2>授权失败</h2>
                        <p class="subtitle">${result.error?.message || '未知错误'}</p>
                        <button class="btn btn-primary" style="justify-content:center;" onclick="location.href='/'">返回登录</button>
                    </div>
                </div>
            `;
        }
    } catch (e: any) {
        app.innerHTML = `
            <div class="login-page">
                <div class="login-card">
                    <h2>授权异常</h2>
                    <p class="subtitle">${e.message}</p>
                    <button class="btn btn-primary" style="justify-content:center;" onclick="location.href='/'">返回登录</button>
                </div>
            </div>
        `;
    }
}
