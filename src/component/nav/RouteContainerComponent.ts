/**
 * RouteContainerComponent — 路由容器组件
 *
 * 通过 listens 声明式监听路由 change 事件，根据 path 挂载对应页面组件。
 * 直接 new + appendChild 管理子组件，无需 content 占位符与 ChildSlotAbility。
 */

import { Component } from '@qimenjs/component-core';

export interface RouteContainerProps {
    routeMap?: Record<string, new (props?: Record<string, any>) => any>;
    defaultComponent?: new (props?: Record<string, any>) => any;
}

class RouteContainerComponent extends Component {
    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _routeMap: Record<string, new (props?: Record<string, any>) => any> = {};
    _defaultComponent: (new (props?: Record<string, any>) => any) | null = null;
    _currentInstance: any = null;

    onAfterInit(props?: RouteContainerProps): void {
        this.addCls('q-route-container');

        if (props?.routeMap) this._routeMap = props.routeMap;
        if (props?.defaultComponent) this._defaultComponent = props.defaultComponent;

        if (this._defaultComponent) {
            this._mountComponent(this._defaultComponent);
        }
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        const PageClass = this._routeMap[path] || this._defaultComponent;
        if (PageClass) {
            this._mountComponent(PageClass);
        }
    }

    private _mountComponent(PageClass: new (props?: Record<string, any>) => any): void {
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        this._currentInstance = new PageClass({ parent: this });
        this.el.appendChild(this._currentInstance.el);
    }

    dispose(): void {
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        super.dispose();
    }
}

export { RouteContainerComponent };
export type RouteContainerComponentInstance = InstanceType<typeof RouteContainerComponent>;
