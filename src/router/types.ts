/**
 * 路由配置类型
 *
 * 路由字典中的值，支持三种形式：
 * - LayoutNode 对象：直接使用
 * - HTML 模板字符串：直接使用
 * - 字符串引用：去 TemplateRegistrar 查找
 */

import type { LayoutNode } from '@qimenjs/layout';

/**
 * 路由配置 — 路由字典的值类型
 *
 * 三种形式：
 * 1. LayoutNode 对象 → 直接渲染
 * 2. HTML 模板字符串（以 '<' 开头）→ 直接作为模板
 * 3. 字符串引用（如 'DashboardPage'）→ 去 TemplateRegistrar 查找
 */
export type RouteConfig = LayoutNode | string;

/**
 * 路由字典 — 路径到配置的映射
 *
 * @example
 * ```typescript
 * const routes: RouteMap = {
 *     '/': { type: 'VBox', children: [...] },     // 直接 LayoutNode
 *     '/users': 'UserPage',                         // 字符串引用 TemplateRegistrar
 *     '/about': '<div data-content="about:content"></div>', // 直接 HTML 模板
 * };
 * ```
 */
export type RouteMap = Record<string, RouteConfig>;

/**
 * 路由参数 — 从路径中提取的动态参数
 *
 * @example
 * 路径 `/users/123` 匹配路由 `/users/:id` → `{ id: '123' }`
 */
export type RouteParams = Record<string, string>;

/**
 * 路由事件载荷
 */
export interface RouteChangeEvent {
    /** 当前路径 */
    path: string;
    /** 上一路径 */
    previousPath: string | null;
    /** 路由参数 */
    params: RouteParams;
    /** 解析后的路由配置 */
    config: RouteConfig | null;
}

/**
 * 路由守卫 — 返回 false 阻止导航
 */
export type RouteGuard = (from: string | null, to: string) => boolean;

/**
 * RouteAbility 的 route 配置 — 声明在 LayoutNode 中
 */
export interface RouteProps {
    /** 路由配置 */
    route?: {
        /** 路由字典：路径 → 配置 */
        routes: RouteMap;
        /** 默认路径，不填则用第一个路由 */
        defaultPath?: string;
        /** 是否使用 hash 模式，默认 true */
        hashMode?: boolean;
        /** 自定义路由变化回调，覆盖默认的自动切换行为 */
        onRouteChange?: (event: RouteChangeEvent) => void;
    };
}
