/**
 * 路由类型定义
 *
 * 新模式：路由只发切换事件，不再解析配置去找组件/模板。
 * 事件名由路径转换而来（/ → :），监听方自行处理。
 */

/**
 * 路由配置 — 路由字典的值类型
 *
 * 保留 Record<string, any> 和字符串形式供路由字典声明使用，
 * 但 Router 不再解析这些配置，只负责发出路径对应的事件。
 */
export type RouteConfig = Record<string, any> | string;

/**
 * 路由字典 — 路径到配置的映射
 */
export type RouteMap = Record<string, RouteConfig>;

/**
 * 路由参数 — 从路径中提取的动态参数
 *
 * @example
 * 路径 /users/123 匹配路由 /users/:id → { id: '123' }
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
    };
}
