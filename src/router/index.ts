/**
 * @qimenjs/router
 *
 * 路由系统 — 声明式路由管理，支持自动切换和自定义回调
 *
 * 核心概念：
 * - Router：路由器单例，管理 URL 和路由状态
 * - RouteAbility：路由监听能力，注入容器组件后自动响应路由变化
 * - RouteMap：路由字典，路径 → 配置的映射
 *
 * 路由配置解析流程：
 * 1. 路由字典查找路径 → 获取 RouteConfig
 * 2. RouteConfig 是 LayoutNode → 直接渲染
 * 3. RouteConfig 是 HTML 模板字符串 → 直接渲染
 * 4. RouteConfig 是字符串引用 → 去 TemplateRegistrar 查找
 *
 * @example
 * ```typescript
 * import { Router, RouteAbility } from '@qimenjs/router';
 *
 * // 1. 注册路由
 * const router = Router.getInstance();
 * router.register({
 *     '/': 'HomePage',
 *     '/users': { type: 'VBox', children: [...] },
 * });
 *
 * // 2. 在容器组件中使用 RouteAbility
 * class AppContainer extends ComponentBase {
 *     static readonly abilities = [RouteAbility, ChildrenAbility, ...];
 * }
 *
 * // 3. 声明式定义（LayoutNode）
 * {
 *     type: 'VBox',
 *     id: 'app',
 *     route: {
 *         routes: {
 *             '/': 'HomePage',
 *             '/users': 'UserPage',
 *         },
 *         defaultPath: '/',
 *     },
 * }
 * ```
 */

// 核心
export { Router, ROUTE_CHANGE_EVENT } from './Router';

// 能力
export { RouteAbility } from './RouteAbility';

// 类型
export type {
    RouteConfig,
    RouteMap,
    RouteParams,
    RouteChangeEvent,
    RouteGuard,
    RouteProps,
} from './types';
