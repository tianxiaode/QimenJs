/**
 * RouteNavComponent — 路由导航组件
 *
 * 继承 NavItemGroupComponent + RouteEmitAbility + RouteListenAbility，
 * 导航点击自动发路由，路由变化自动切换高亮。
 *
 * 使用方式：
 * - 在模板中用 json 声明，通过 children 传入 pathIndex、indexPath 和 items
 * - 导航点击 → onNavClick → this.navigate(path)
 * - 路由变化 → onRouteChange → selectAt(index)
 *
 * @example
 * ```js
 * // 模板中声明
 * { tag: 'div', content: 'shell:nav', json: RouteNavComponent, jsonMode: 'child' }
 *
 * // children 配置
 * static children = {
 *     nav: {
 *         pathIndex: { '/': 0, '/icons': 1, '/theme': 2 },
 *         indexPath: ['/', '/icons', '/theme'],
 *         items: [
 *             { text: '首页', icon: '🏠', active: true },
 *             { text: '图标库', icon: '🐉' },
 *             { text: '主题', icon: '☯' },
 *         ],
 *         activeIndex: 0,
 *     },
 * };
 * ```
 */

import { NavItemGroupComponent } from './NavItemGroupComponent';
import { RouteAbility, RouteEmitAbility, RouteListenAbility } from '@qimenjs/router';

/** 路由导航配置 */
export interface RouteNavProps {
    /** 排列方向 */
    direction?: 'horizontal' | 'vertical';
    /** 子项间距 */
    gap?: string;
    /** 根元素额外 CSS 类名 */
    cls?: string;
    /** 子项挂载区额外 CSS 类名 */
    itemsCls?: string;
    /** 初始选中索引 */
    activeIndex?: number;
    /** 路径到索引的映射 */
    pathIndex?: Record<string, number>;
    /** 索引到路径的映射 */
    indexPath?: string[];
    /** 初始子项数据数组 */
    items?: Record<string, any>[];
}

// NavItemGroupComponent 继承自 withTemplate 强类，运行时有 .with() 方法
// TS 类型无法推断，需 as any 绕过
const RouteNavBase = (NavItemGroupComponent as any).with([RouteAbility, RouteEmitAbility, RouteListenAbility]);

export class RouteNavComponent extends RouteNavBase {
    /** 路径到索引的映射 */
    private _pathIndex: Record<string, number> = {};

    /** 索引到路径的映射 */
    private _indexPath: string[] = [];

    /** 上一次通过 navigate 发送的路径，用于避免路由回传时重复导航 */
    private _lastNavigatedPath: string | null = null;

    constructor(props?: RouteNavProps) {
        super(props);

        this.type = 'RouteNav';

        this.logger.debug('[RouteNav] constructor, props =', props);

        if (props?.pathIndex) this._pathIndex = props.pathIndex;
        if (props?.indexPath) this._indexPath = props.indexPath;
    }

    /**
     * 重写事件转发处理
     *
     * 直接处理子组件的 click 事件，不再 emit 到全局 EventBus，
     * 避免与 NavItem 直接 emit 的 click 事件冲突导致 onNavClick 被多次调用。
     */
    protected onForwardEvent(event: string, data: Record<string, any>): void {
        if (event === 'click') {
            this.onNavClick(data);
        } else {
            // 其他事件走默认转发
            super.onForwardEvent(event, data);
        }
    }

    /** 导航点击时切换路由 */
    onNavClick(data: any): void {
        const index = data?.index ?? this.activeIndex;
        const path = this._indexPath[index];
        this.logger.debug('[RouteNav] onNavClick, index =', index, 'path =', path, '_indexPath =', this._indexPath);
        if (!path) return;

        // 切换高亮
        this.selectAt(index);

        // 记录本次发送的路径，避免路由回传时重复导航
        this._lastNavigatedPath = path;
        this.navigate(path);
    }

    /** 路由变化时自动切换高亮 */
    onRouteChange(event: any): void {
        const path = event?.path;
        this.logger.debug('[RouteNav] onRouteChange, path =', path, '_lastNavigatedPath =', this._lastNavigatedPath);
        if (path) {
            // 如果路由回传的路径和上次 navigate 发送的路径一致，说明是自身触发的，不需要再 navigate
            if (path === this._lastNavigatedPath) {
                this.logger.debug('[RouteNav] onRouteChange skipped, same as last navigated path');
                // 仍然需要切换高亮
                const index = this._pathIndex[path];
                if (index !== undefined) {
                    this.selectAt(index);
                }
                return;
            }
            const index = this._pathIndex[path];
            if (index !== undefined) {
                this.selectAt(index);
            }
        }
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.pathIndex !== undefined) {
            this._pathIndex = props.pathIndex;
        }
        if (props?.indexPath !== undefined) {
            this._indexPath = props.indexPath;
        }
    }
}
