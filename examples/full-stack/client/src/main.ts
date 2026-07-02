/**
 * OrbitJS 全栈示例 - 应用入口
 */
import './config';
import { oauth2 } from './config';

// 路由判断
function init() {
    const path = window.location.pathname;

    // 授权码回调
    if (path === '/callback' || new URLSearchParams(window.location.search).has('code')) {
        import('./pages/callback').then(({ handleCallback }) => handleCallback());
        return;
    }

    // 已认证则显示仪表盘
    if (oauth2.isAuthenticated()) {
        import('./pages/dashboard').then(({ showDashboard }) => showDashboard());
    } else {
        import('./pages/login').then(({ showLoginPage }) => showLoginPage());
    }
}

init();
