/**
 * Router — 路由器核心
 *
 * 管理 URL 和路由状态的映射，支持 hash 和 history 两种模式。
 * 路由变化时通过 emit 发布路由切换事件（source='router'）。
 *
 * 事件命名规则：
 * - 无路径时发 change
 * - 有路径时发 change:路径（/ 替换为 :）
 * 例如路径 /users/list → 事件名 change:users:list
 *
 * 监听方通过 EventBridgeAbility 监听 router 源，
 * 用 match 过滤只关心的路径事件，避免全触发。
 */

import { ComposableBase } from '@/composable';
import { EventAbility } from '@/system-abilities';
import { EventSourceRegistrar, EventBridge } from '@qimenjs/events';
import { EventContextBuilder } from '@/context';
import type { RouteMap, RouteParams, RouteChangeEvent, RouteGuard } from './types';

/**
 * 将路由路径转换为事件名
 *
 * 规则：将 / 替换为 :
 * 例如：'/' → ':', '/users' → ':users', '/users/list' → ':users:list'
 */
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
 * 继承 ComposableBase.with(EventAbility)，通过 emit 发布路由切换事件。
 * 路由变化时发出以路径转换的事件名，由监听方自行处理。
 * source='router'，scopeId 为 router 的 eventScope.scopeId。
 */
export class Router extends ComposableBase.with(EventAbility) {
    private static instance: Router | null = null;

    /** 路由字典 */
    private routes: RouteMap = {};

    /** 当前路径 */
    private currentPath: string | null = null;

    /** 是否使用 hash 模式 */
    private hashMode: boolean = true;

    /** 是否已启动监听 */
    private listening: boolean = false;

    /** 路由守卫列表 */
    private guards: RouteGuard[] = [];

    /** popstate/hashchange 解绑函数 */
    private unlisten: (() => void) | null = null;

    /** eventKey 标识，用于 EventSourceRegistrar 注册和事件桥对照 */
    static eventKey = 'router';

    private constructor() {
        super();
        // 注册到 EventSourceRegistrar，使 EventBridgeAbility 能通过 source='router' 找到
        EventSourceRegistrar.getInstance().register('router', this);
    }

    /**
     * 获取路由器单例
     */
    static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    // ─── 路由注册 ───

    /**
     * 注册路由字典
     *
     * @param routes - 路径到配置的映射
     */
    register(routes: RouteMap): void {
        this.routes = { ...this.routes, ...routes };
    }

    /**
     * 清空路由字典
     */
    clearRoutes(): void {
        this.routes = {};
    }

    // ─── 路由守卫 ───

    /**
     * 添加路由守卫
     *
     * 守卫返回 false 阻止导航。
     */
    addGuard(guard: RouteGuard): void {
        this.guards.push(guard);
    }

    /**
     * 移除路由守卫
     */
    removeGuard(guard: RouteGuard): void {
        const idx = this.guards.indexOf(guard);
        if (idx !== -1) this.guards.splice(idx, 1);
    }

    // ─── 启动/停止 ───

    /**
     * 启动路由监听
     *
     * @param hashMode - 是否使用 hash 模式，默认 true
     */
    start(hashMode: boolean = true): void {
        if (this.listening) return;
        this.hashMode = hashMode;

        if (hashMode) {
            window.addEventListener('hashchange', this.handleHashChange);
            this.unlisten = () => window.removeEventListener('hashchange', this.handleHashChange);
        } else {
            window.addEventListener('popstate', this.handlePopState);
            this.unlisten = () => window.removeEventListener('popstate', this.handlePopState);
        }

        this.listening = true;

        // 延迟初始导航：等组件注册完 EventBridge 监听后再 emit
        // 避免初始路由事件在监听注册之前发出导致丢失
        queueMicrotask(() => {
            const initialPath = this.getCurrentPath();
            if (initialPath) {
                this.navigate(initialPath, true);
            } else if (Object.keys(this.routes).length > 0) {
                // 没有路径时导航到第一个路由
                const firstRoute = Object.keys(this.routes)[0];
                this.navigate(firstRoute, true);
            }
        });
    }

    /**
     * 停止路由监听
     */
    stop(): void {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
        this.listening = false;
    }

    // ─── 导航 ───

    /**
     * 导航到指定路径
     *
     * @param path - 目标路径
     * @param replace - 是否替换当前历史记录（初始导航时用）
     */
    navigate(path: string, replace: boolean = false): void {
        // 执行守卫
        for (const guard of this.guards) {
            if (!guard(this.currentPath, path)) {
                return;
            }
        }

        // 更新 URL
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

        // 触发路由变化
        this.applyRoute(path);
    }

    /**
     * 获取当前路径
     */
    getPath(): string | null {
        return this.currentPath;
    }

    // ─── 路径匹配 ───

    /**
     * 匹配动态路由模式
     *
     * @param pattern - 路由模式（如 /users/:id）
     * @param path - 实际路径
     * @returns 参数对象，不匹配返回 null
     */
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

    // ─── 内部方法 ───

    /**
     * 应用路由变化 — 通过 emit 发布路径对应的切换事件
     *
     * 事件命名：change 或 change:路径（source='router'）
     * 监听方通过 EventBridge 的 match 过滤只关心的路径事件
     */
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

        // 通过 EventBridge 发送桥接事件（source='router'，走 bridgeScope 隔离通道）
        // 监听方通过 EventBridge.bridgeOn('router', 'change', handler) 接收
        const bridge = EventBridge.getInstance();
        bridge.bridgeEmit(
            EventContextBuilder.create()
                .withEvent('change')
                .withType('change')
                .withSource('router')
                .withData(event)
                .build()
        );
        if (eventName) {
            bridge.bridgeEmit(
                EventContextBuilder.create()
                    .withEvent(`change:${eventName}`)
                    .withType(`change:${eventName}`)
                    .withSource('router')
                    .withData(event)
                    .build()
            );
        }
    }

    /**
     * 提取路由参数
     */
    private extractParams(path: string): RouteParams {
        // 先尝试精确匹配
        if (this.routes[path] !== undefined) {
            return {};
        }

        // 动态参数匹配
        for (const [pattern] of Object.entries(this.routes)) {
            const params = this.matchPattern(pattern, path);
            if (params !== null) {
                return params;
            }
        }

        return {};
    }

    /**
     * 从当前 URL 获取路径
     */
    private getCurrentPath(): string {
        if (this.hashMode) {
            const hash = window.location.hash;
            return hash ? hash.slice(1) : '';
        } else {
            return window.location.pathname;
        }
    }

    // ─── 事件处理 ───

    private handleHashChange = (): void => {
        const path = this.getCurrentPath();
        if (path && path !== this.currentPath) {
            this.applyRoute(path);
        }
    };

    private handlePopState = (): void => {
        const path = this.getCurrentPath();
        if (path !== this.currentPath) {
            this.applyRoute(path);
        }
    };
}
