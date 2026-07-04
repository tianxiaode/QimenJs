/**
 * OrbitJS 管理模板 - 应用入口
 */
import './config';
import { oauth2 } from './config';
import { renderLayout, setActivePage, onPageChange, renderPageContent } from './layout';

// 页面路由映射表
const pageRoutes: Record<string, () => Promise<Record<string, Function>>> = {
    'dashboard': () => import('./pages/dashboard'),
    'error': () => import('./pages/error'),
    'logger': () => import('./pages/logger'),
    'utils': () => import('./pages/utils'),
    'async': () => import('./pages/async'),
    'runtime': () => import('./pages/runtime'),
    'crypto': () => import('./pages/crypto'),
    'types': () => import('./pages/types'),
    'i18n': () => import('./pages/i18n'),
    'registry': () => import('./pages/registry'),
    'cache': () => import('./pages/cache'),
    'events': () => import('./pages/events'),
    'task': () => import('./pages/task'),
    'composable': () => import('./pages/composable'),
    'context': () => import('./pages/context'),
    'schema': () => import('./pages/schema'),
    'validation': () => import('./pages/validation'),
    'pipeline': () => import('./pages/pipeline'),
    'mime': () => import('./pages/mime'),
    'pattern': () => import('./pages/pattern'),
    'event-dom': () => import('./pages/event-dom'),
    'data-processor': () => import('./pages/data-processor'),
    'http': () => import('./pages/http'),
    'system-abilities': () => import('./pages/system-abilities'),
    'abp-users': () => import('./pages/abp-users'),
    'abp-products': () => import('./pages/abp-products'),
    'spring-orders': () => import('./pages/spring-orders'),
    'spring-items': () => import('./pages/spring-items'),
    'departments': () => import('./pages/departments'),
    'notifications': () => import('./pages/notifications'),
    'tags': () => import('./pages/tags'),
};

// 页面渲染函数名映射
const renderFnNames: Record<string, string> = {
    'dashboard': 'renderDashboard',
    'error': 'renderError',
    'logger': 'renderLogger',
    'utils': 'renderUtils',
    'async': 'renderAsync',
    'runtime': 'renderRuntime',
    'crypto': 'renderCrypto',
    'types': 'renderTypes',
    'i18n': 'renderI18n',
    'registry': 'renderRegistry',
    'cache': 'renderCache',
    'events': 'renderEvents',
    'task': 'renderTask',
    'composable': 'renderComposable',
    'context': 'renderContext',
    'schema': 'renderSchema',
    'validation': 'renderValidation',
    'pipeline': 'renderPipeline',
    'mime': 'renderMime',
    'pattern': 'renderPattern',
    'event-dom': 'renderEventDom',
    'data-processor': 'renderDataProcessor',
    'http': 'renderHttp',
    'system-abilities': 'renderSystemAbilities',
    'abp-users': 'renderAbpUsers',
    'abp-products': 'renderAbpProducts',
    'spring-orders': 'renderSpringOrders',
    'spring-items': 'renderSpringItems',
    'departments': 'renderDepartments',
    'notifications': 'renderNotifications',
    'tags': 'renderTags',
};

/**
 * 注册页面切换路由回调，供 main/login/callback 共用
 */
export function setupPageRouter(): void {
    onPageChange(async (pageId) => {
        const loader = pageRoutes[pageId];
        if (!loader) {
            renderPageContent(`<div class="card"><p>页面 "${pageId}" 未找到</p></div>`);
            return;
        }
        try {
            const mod = await loader();
            const fnName = renderFnNames[pageId];
            const renderFn = mod[fnName];
            if (renderFn) {
                renderFn();
            } else {
                renderPageContent(`<div class="card"><p>页面 "${pageId}" 渲染函数未找到</p></div>`);
            }
        } catch (err) {
            console.error(`加载页面 ${pageId} 失败:`, err);
            renderPageContent(`<div class="card"><p>加载失败，请刷新重试</p><p class="text-sm text-muted">${err}</p></div>`);
        }
    });
}

// 路由判断
function init() {
    const path = window.location.pathname;

    // 授权码回调
    if (path === '/callback' || new URLSearchParams(window.location.search).has('code')) {
        import('./pages/callback').then(({ handleCallback }) => handleCallback());
        return;
    }

    // 已认证则显示管理模板
    if (oauth2.isAuthenticated()) {
        showApp();
    } else {
        import('./pages/login').then(({ showLoginPage }) => showLoginPage());
    }
}

export function showApp(): void {
    renderLayout(true);
    setupPageRouter();

    // 默认加载仪表盘
    import('./pages/dashboard').then(({ renderDashboard }) => renderDashboard());
}

// 登出
(window as any).__logout = async () => {
    await oauth2.logout();
    const { showLoginPage } = await import('./pages/login');
    showLoginPage();
};

init();
