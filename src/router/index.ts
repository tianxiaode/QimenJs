/**
 * @qimenjs/router
 *
 * 路由系统 — 基于 RouteEventBus 的双向事件驱动路由
 *
 * Router 作为 RouteEventBus 的双向参与者：
 * - 监听 switch 事件 → 执行导航
 * - 发出 change 事件 → 通知路由变化
 *
 * 组件通过 RouteEventBusAbility 直接交互：
 * - this.routeEmit(switchCtx) → 导航
 * - this.routeOn('router', 'change', handler) → 监听变化
 * - 或用 listens 声明：{ route: 'router', events: { change: 'onRouteChange' } }
 *
 * @example
 * ```typescript
 * import { Router } from '@qimenjs/router';
 * import { RouteEventBusAbility } from '@qimenjs/system-abilities';
 * import { EventContextBuilder } from '@qimenjs/context';
 *
 * // 1. 注册路由并启动
 * const router = Router.getInstance();
 * router.register({ '/': 'HomePage', '/users': 'UserPage' });
 * router.start(true);
 *
 * // 2. 组件导航（需混入 RouteEventBusAbility）
 * this.routeEmit(EventContextBuilder.create()
 *     .withEvent('switch').withType('switch').withSource('router')
 *     .withData({ path: '/users' }).build());
 *
 * // 3. 组件监听（需混入 RouteEventBusAbility）
 * this.routeOn('router', 'change', (data) => {
 *     console.log('路由变化:', data.path);
 * });
 * ```
 */

export { Router, pathToEventName } from './Router';

export type {
    RouteConfig,
    RouteMap,
    RouteParams,
    RouteChangeEvent,
    RouteGuard,
    RouteProps,
} from './types';
