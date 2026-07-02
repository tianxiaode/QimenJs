/**
 * 登录页
 */
import { oauth2 } from '../config';
import { render, card, button, error } from '../utils/render';

export function showLoginPage(): void {
    render('app', `
        <div style="max-width: 400px; margin: 80px auto; font-family: sans-serif;">
            <h2 style="text-align: center;">OrbitJS 全栈示例</h2>
            <p style="text-align: center; color: #666;">OAuth2 + ABP + Spring 多域数据获取</p>
            
            ${card('密码模式登录', `
                <div style="margin: 8px 0;">
                    <label>用户名：</label><br>
                    <input id="username" type="text" value="admin" style="width: 100%; padding: 8px; margin: 4px 0; box-sizing: border-box;">
                </div>
                <div style="margin: 8px 0;">
                    <label>密码：</label><br>
                    <input id="password" type="password" value="123456" style="width: 100%; padding: 8px; margin: 4px 0; box-sizing: border-box;">
                </div>
                <div id="login-error"></div>
                ${button('登录', 'window.__login()', '#4CAF50')}
            `, '#4CAF50')}
            
            ${card('授权码模式', `
                <p style="color: #666; font-size: 14px;">跳转到授权页面，用户同意后回调</p>
                ${button('授权码登录', 'window.__authorize()', '#2196F3')}
            `, '#2196F3')}
            
            ${card('客户端凭证模式', `
                <p style="color: #666; font-size: 14px;">服务间调用，无用户上下文</p>
                ${button('客户端凭证登录', 'window.__clientCredentials()', '#FF9800')}
            `, '#FF9800')}
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                测试账号：admin / 123456
            </div>
        </div>
    `);
}

// 暴露到 window 供 onclick 调用
(window as any).__login = async () => {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const result = await oauth2.loginWithPassword({ username, password });
    if (result.success) {
        console.log('[Login] Success:', result.accessToken);
        // 动态导入 dashboard 避免循环依赖
        const { showDashboard } = await import('./dashboard');
        showDashboard();
    } else {
        document.getElementById('login-error')!.innerHTML = error(result.error?.message || '登录失败');
    }
};

(window as any).__authorize = () => {
    oauth2.authorize();
};

(window as any).__clientCredentials = async () => {
    const result = await oauth2.loginWithClientCredentials();
    if (result.success) {
        const { showDashboard } = await import('./dashboard');
        showDashboard();
    } else {
        document.getElementById('login-error')!.innerHTML = error(result.error?.message || '登录失败');
    }
};
