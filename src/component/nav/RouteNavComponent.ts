/**
 * RouteNavComponent — 路由导航组件
 *
 * 继承 NavItemGroupComponent + RouteEmitAbility + RouteListenAbility，
 * 导航点击自动发路由，路由变化自动切换高亮。
 *
 * 使用方式：
 * - 在模板中用 json 声明，通过 children 传入 pathIndex、indexPath 和 items
 * - 导航点击 → onNavSelect → this.navigate(path)
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
import { RouteEmitAbility, RouteListenAbility } from '@qimenjs/router';

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
const RouteNavBase = (NavItemGroupComponent as any).with([RouteEmitAbility, RouteListenAbility]);

export class RouteNavComponent extends RouteNavBase {
    /** 路径到索引的映射 */
    private _pathIndex: Record<string, number> = {};

    /** 索引到路径的映射 */
    private _indexPath: string[] = [];

    constructor(props?: RouteNavProps) {
        super(props);

        this.type = 'RouteNav';

        if (props?.pathIndex) this._pathIndex = props.pathIndex;
        if (props?.indexPath) this._indexPath = props.indexPath;
    }

    /** 导航选中时切换路由 */
    onNavSelect(data: any): void {
        const index = data?.index ?? this.activeIndex;
        const path = this._indexPath[index];
        if (!path) return;
        this.navigate(path);
    }

    /** 路由变化时自动切换高亮 */
    onRouteChange(event: any): void {
        const path = event?.path;
        if (path) {
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
