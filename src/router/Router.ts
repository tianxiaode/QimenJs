/**
 * Router — 路由器核心
 *
 * 管理 URL 和路由状态的映射，支持 hash 和 history 两种模式。
 * 路由变化时通过 GlobalEventBus 发出 route:change 事件。
 *
 * 路由解析流程：
 * 1. URL 变化 → 提取路径
 * 2. 路径匹配路由字典 → 获取 RouteConfig
 * 3. RouteConfig 解析：
 *    - LayoutNode 对象 → 直接使用
 *    - HTML 模板字符串（以 '<' 开头）→ 直接使用
 *    - 字符串引用 → 去 TemplateRegistrar 查找
 * 4. 发出 route:change 事件
 */

import { globalEventBus } from '@qimenjs/events';
import { RegistryHub } from '@qimenjs/registry';
import { TemplateRegistrar } from '@qimenjs/template';
import type { LayoutNode } from '@qimenjs/layout';
import type { RouteMap, RouteConfig, RouteParams, RouteChangeEvent, RouteGuard } from './types';

/** 路由事件名 */
export const ROUTE_CHANGE_EVENT = 'route:change';

/**
 * 路由器类
 *
 * 单例模式，管理路由状态和 URL 监听。
 */
export class Router {
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

    private constructor() {}

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

        // 初始导航：读取当前 URL
        const initialPath = this.getCurrentPath();
        if (initialPath) {
            this.navigate(initialPath, true);
        } else if (Object.keys(this.routes).length > 0) {
            // 没有路径时导航到第一个路由
            const firstRoute = Object.keys(this.routes)[0];
            this.navigate(firstRoute, true);
        }
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
                window.location.replace(`#${path}`);
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

    /**
     * 获取当前路由配置
     */
    getCurrentConfig(): RouteConfig | null {
        if (!this.currentPath) return null;
        return this.resolveConfig(this.currentPath);
    }

    // ─── 配置解析 ───

    /**
     * 解析路由配置
     *
     * 解析流程：
     * 1. 先查路由字典
     * 2. 如果值是 LayoutNode 对象 → 直接返回
     * 3. 如果值是 HTML 模板字符串（以 '<' 开头）→ 直接返回
     * 4. 如果值是字符串引用 → 去 TemplateRegistrar 查找
     */
    resolveConfig(path: string): RouteConfig | null {
        // 1. 精确匹配
        const config = this.routes[path];
        if (config !== undefined) {
            return this.resolveReference(config);
        }

        // 2. 动态参数匹配（如 /users/:id）
        for (const [pattern, routeConfig] of Object.entries(this.routes)) {
            const params = this.matchPattern(pattern, path);
            if (params !== null) {
                return this.resolveReference(routeConfig);
            }
        }

        return null;
    }

    /**
     * 解析引用 — 如果是字符串引用则去 TemplateRegistrar 查找
     */
    private resolveReference(config: RouteConfig): RouteConfig {
        if (typeof config !== 'string') {
            // LayoutNode 对象，直接返回
            return config;
        }

        // HTML 模板字符串（以 '<' 开头），直接返回
        if (config.trim().startsWith('<')) {
            return config;
        }

        // 字符串引用 → 去 TemplateRegistrar 查找
        const templateRegistrar = RegistryHub.get<TemplateRegistrar>('template');
        if (templateRegistrar) {
            if (templateRegistrar.isJson(config)) {
                return templateRegistrar.getJson(config);
            }
            if (templateRegistrar.isHtml(config)) {
                return templateRegistrar.get(config);
            }
        }

        // 找不到，返回原始字符串引用（让调用方处理）
        return config;
    }

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
     * 应用路由变化
     */
    private applyRoute(path: string): void {
        const previousPath = this.currentPath;
        this.currentPath = path;

        const config = this.resolveConfig(path);
        const params = this.extractParams(path);

        const event: RouteChangeEvent = {
            path,
            previousPath,
            params,
            config,
        };

        globalEventBus.emit(ROUTE_CHANGE_EVENT, event);
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
