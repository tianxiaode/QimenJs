/**
 * RouteContainerComponent — 路由容器组件
 *
 * 混入 RouteEventBusAbility + ChildSlotAbility，
 * 通过 routeOn 监听路由变化，根据 path 自动替换内容区域的子组件。
 */

import { Component } from '@qimenjs/component-core';
import { RouteEventBusAbility } from '@qimenjs/system-abilities';
import { ChildSlotAbility } from '@qimenjs/component-abilities/render/ChildSlotAbility';

export interface RouteContainerProps {
    routeMap?: Record<string, new (props?: Record<string, any>) => any>;
    defaultComponent?: new (props?: Record<string, any>) => any;
}

class RouteContainerComponent extends Component {
    _routeMap: Record<string, new (props?: Record<string, any>) => any> = {};
    _defaultComponent: (new (props?: Record<string, any>) => any) | null = null;

    onAfterInit(props?: RouteContainerProps): void {
        this.el.classList.add('q-route-container');

        this.logger.debug(
            '[RouteContainer] onAfterInit, routeMap keys =',
            props?.routeMap ? Object.keys(props.routeMap) : [],
            'defaultComponent =',
            !!props?.defaultComponent
        );

        if (props?.routeMap) this._routeMap = props.routeMap;
        if (props?.defaultComponent) this._defaultComponent = props.defaultComponent;

        if (this._defaultComponent) {
            this.logger.debug('[RouteContainer] mounting default component');
            this._replaceChildComponent('content', this._defaultComponent);
        } else {
            this.logger.debug('[RouteContainer] NO default component');
        }

        const off = this.routeOn('router', 'change', (data: any) => {
            this.onRouteChange(data);
        });
        this.onCleanup(off);
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        this.logger.debug(
            '[RouteContainer] onRouteChange, path =',
            path,
            'routeMap keys =',
            Object.keys(this._routeMap)
        );
        const PageClass = this._routeMap[path] || this._defaultComponent;
        this.logger.debug(
            '[RouteContainer] resolved PageClass =',
            PageClass?.name || (PageClass as any)?.type || 'null'
        );
        if (PageClass) {
            this._replaceChildComponent('content', PageClass);
        }
    }
}

RouteContainerComponent.use([RouteEventBusAbility, ChildSlotAbility]);

export { RouteContainerComponent };
export type RouteContainerComponentInstance = InstanceType<typeof RouteContainerComponent>;
