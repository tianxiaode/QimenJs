/**
 * 授权码回调页
 * 
 * 处理授权码模式回调，用 code 换 token
 */
import { oauth2 } from '../config';
import { render, error } from '../utils/render';

export async function handleCallback(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const err = params.get('error');

    render('app', `
        <div style="max-width: 400px; margin: 80px auto; font-family: sans-serif; text-align: center;">
            <h2>授权码回调处理中...</h2>
            <div id="callback-status"></div>
        </div>
    `);

    if (err) {
        document.getElementById('callback-status')!.innerHTML = error(`授权被拒绝: ${err}`);
        setTimeout(() => {
            const { showLoginPage } = require('./login');
            showLoginPage();
        }, 2000);
        return;
    }

    if (!code) {
        document.getElementById('callback-status')!.innerHTML = error('未收到授权码');
        return;
    }

    const result = await oauth2.loginWithCode(code);
    if (result.success) {
        document.getElementById('callback-status')!.innerHTML = '<p style="color: #4CAF50;">授权成功，正在跳转...</p>';
        // 清除 URL 中的 code 参数
        window.history.replaceState({}, '', '/');
        const { showDashboard } = await import('./dashboard');
        showDashboard();
    } else {
        document.getElementById('callback-status')!.innerHTML = error(result.error?.message || '授权失败');
    }
}
