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
 * 新模式：路由只发切换事件，事件名由路径 / 替换为 :
 * 监听方通过 EventBridgeAbility 监听 router 源事件实现刷新
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
export { Router, pathToEventName } from './Router';

// 能力
export { RouteAbility } from './RouteAbility';
export { RouteEmitAbility } from './RouteEmitAbility';
export { RouteListenAbility } from './RouteListenAbility';

// 类型
export type {
    RouteConfig,
    RouteMap,
    RouteParams,
    RouteChangeEvent,
    RouteGuard,
    RouteProps,
} from './types';
