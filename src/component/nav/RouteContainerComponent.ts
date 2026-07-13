/**
 * RouteContainerComponent — 路由容器组件
 *
 * 挂载 RouteListenAbility + ChildSlotAbility，
 * 路由变化时根据 path 自动替换内容区域的子组件。
 *
 * 使用方式：
 * - 在模板中用 json 声明，通过 children 传入 routeMap 和 defaultComponent
 * - 路由变化 → onRouteChange → _replaceChildComponent 自动替换内容
 *
 * @example
 * ```js
 * // AppShell 模板中声明
 * { tag: 'div', content: 'shell:page', json: RouteContainerComponent, jsonMode: 'child' }
 *
 * // children 配置
 * static children = {
 *     page: {
 *         routeMap: { '/': HomePage, '/icons': IconsPage, '/theme': ThemePage },
 *         defaultComponent: HomePage,
 *     },
 * };
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { RouteListenAbility } from '@qimenjs/router';
import { ChildSlotAbility } from '@qimenjs/component-abilities/render/ChildSlotAbility';

/** 路由容器配置 */
export interface RouteContainerProps {
    /** 路径到组件类的映射 */
    routeMap?: Record<string, new (props?: Record<string, any>) => any>;
    /** 默认组件类 */
    defaultComponent?: new (props?: Record<string, any>) => any;
}

export class RouteContainerComponent extends TemplateComponent.withTemplate([
    { tag: 'div', class: 'q-route-container', children: [
        { tag: 'div', content: 'container:content', jsonMode: 'child' },
    ]},
]).with([RouteListenAbility, ChildSlotAbility]) {
    static type = 'RouteContainer';

    /** 路径到组件类的映射 */
    private _routeMap: Record<string, new (props?: Record<string, any>) => any> = {};

    /** 默认组件类 */
    private _defaultComponent: (new (props?: Record<string, any>) => any) | null = null;

    constructor(props?: RouteContainerProps) {
        super(props);

        this.el.classList.add('q-route-container');

        if (props?.routeMap) this._routeMap = props.routeMap;
        if (props?.defaultComponent) this._defaultComponent = props.defaultComponent;

        // 挂载默认组件
        if (this._defaultComponent) {
            this._replaceChildComponent('content', this._defaultComponent);
        }
    }

    /** 路由变化时替换内容区域 */
    onRouteChange(event: any): void {
        const path = event?.path;
        const PageClass = this._routeMap[path] || this._defaultComponent;
        if (PageClass) {
            this._replaceChildComponent('content', PageClass);
        }
    }
}
