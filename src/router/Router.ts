/**
 * Router — 路由器核心
 *
 * 管理 URL 和路由状态的映射，支持 hash 和 history 两种模式。
 * 作为 RouteEventBus 的双向参与者：
 *
 * - 监听 switch 事件 → 执行导航（组件通过 this.routeEmit 发送 switch）
 * - 发出 change 事件 → 通知路由变化（组件通过 this.routeOn 监听 change）
 *
 * 事件命名规则：
 * - switch：{ path, replace? } → Router 执行导航
 * - change：{ path, previousPath, params } → 路由变化通知
 * - change:路径：细分路径事件（/ 替换为 :）
 *
 * 窗口事件（hashchange/popstate）通过 SystemEventBusAbility 监听。
 *
 * @example
 * ```ts
 * // 导航（组件侧，需 RouteEventBusAbility）
 * this.routeEmit(EventContextBuilder.create()
 *     .withEvent('switch').withType('switch').withSource('router')
 *     .withData({ path: '/users', replace: false }).build());
 *
 * // 监听（组件侧，需 RouteEventBusAbility）
 * this.routeOn('router', 'change', (data) => { ... });
 *
 * // 或用 listens 声明
 * listens: [{ route: 'router', events: { change: 'onRouteChange' } }]
 * ```
 */

import { ComposableBase, withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import { SystemEventBusAbility, RouteEventBusAbility } from '@/system-abilities';
import { SYSTEM_EVENTS } from '@qimenjs/events';
import { EventContextBuilder } from '@/context';
import type { RouteMap, RouteParams, RouteChangeEvent, RouteGuard } from './types';

export function pathToEventName(path: string): string {
    return path
        .split('/')
        .map(s => s.trim())
        .filter(Boolean)
        .join(':');
}

/**
 * 路由器类
 *
 * RouteEventBus 双向参与者：
 * - routeOn('router', 'switch') ← 接收导航指令
 * - routeEmit('change') → 发出路由变化通知
 */
export class Router extends ComposableBase {
    private static instance: Router | null = null;

    private routes: RouteMap = {};
    private currentPath: string | null = null;
    private hashMode: boolean = true;
    private listening: boolean = false;
    private guards: RouteGuard[] = [];

    private constructor() {
        super();
    }

    static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    register(routes: RouteMap): void {
        this.routes = { ...this.routes, ...routes };
    }

    clearRoutes(): void {
        this.routes = {};
    }

    addGuard(guard: RouteGuard): void {
        this.guards.push(guard);
    }

    removeGuard(guard: RouteGuard): void {
        const idx = this.guards.indexOf(guard);
        if (idx !== -1) this.guards.splice(idx, 1);
    }

    start(hashMode: boolean = true): void {
        if (this.listening) return;
        this.hashMode = hashMode;

        if (hashMode) {
            const off = this.systemOn(SYSTEM_EVENTS.WINDOW_HASH_CHANGE, () => {
                this.handleUrlChange();
            });
            this.onCleanup(off);
        } else {
            const off = this.systemOn(SYSTEM_EVENTS.WINDOW_POP_STATE, () => {
                this.handleUrlChange();
            });
            this.onCleanup(off);
        }

        const offSwitch = this.routeOn('router', 'switch', (data: any) => {
            this.navigate(data.path, data.replace ?? false);
        });
        this.onCleanup(offSwitch);

        this.listening = true;

        queueMicrotask(() => {
            const initialPath = this.getCurrentPath();
            if (initialPath) {
                this.navigate(initialPath, true);
            } else if (Object.keys(this.routes).length > 0) {
                const firstRoute = Object.keys(this.routes)[0];
                this.navigate(firstRoute, true);
            }
        });
    }

    stop(): void {
        this.listening = false;
    }

    navigate(path: string, replace: boolean = false): void {
        for (const guard of this.guards) {
            if (!guard(this.currentPath, path)) {
                return;
            }
        }

        if (this.hashMode) {
            if (replace) {
                window.location.replace('#' + path);
            } else {
                window.location.hash = path;
            }
        } else {
            if (replace) {
                window.history.replaceState({}, '', path);
            } else {
                window.history.pushState({}, '', path);
            }
        }

        this.applyRoute(path);
    }

    getPath(): string | null {
        return this.currentPath;
    }

    matchPattern(pattern: string, path: string): RouteParams | null {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params: RouteParams = {};
        for (let i = 0; i < patternParts.length; i++) {
            const pp = patternParts[i];
            const actual = pathParts[i];

            if (pp.startsWith(':')) {
                params[pp.slice(1)] = actual;
            } else if (pp !== actual) {
                return null;
            }
        }

        return params;
    }

    private applyRoute(path: string): void {
        const previousPath = this.currentPath;
        this.currentPath = path;

        const params = this.extractParams(path);
        const eventName = pathToEventName(path);

        const event: RouteChangeEvent = {
            path,
            previousPath,
            params,
        };

        this.routeEmit(
            EventContextBuilder.create()
                .withEvent('change')
                .withType('change')
                .withSource('router')
                .withData(event)
                .build()
        );
        if (eventName) {
            this.routeEmit(
                EventContextBuilder.create()
                    .withEvent(`change:${eventName}`)
                    .withType(`change:${eventName}`)
                    .withSource('router')
                    .withData(event)
                    .build()
            );
        }
    }

    private extractParams(path: string): RouteParams {
        if (this.routes[path] !== undefined) {
            return {};
        }

        for (const [pattern] of Object.entries(this.routes)) {
            const params = this.matchPattern(pattern, path);
            if (params !== null) {
                return params;
            }
        }

        return {};
    }

    private getCurrentPath(): string {
        if (this.hashMode) {
            const hash = window.location.hash;
            return hash ? hash.slice(1) : '';
        } else {
            return window.location.pathname;
        }
    }

    private handleUrlChange(): void {
        const path = this.getCurrentPath();
        if (path && path !== this.currentPath) {
            this.applyRoute(path);
        }
    }
}

withAbilities(Router, [SystemEventBusAbility, RouteEventBusAbility]);

export interface Router extends InferAbilities<
    [typeof SystemEventBusAbility, typeof RouteEventBusAbility]
> {}
