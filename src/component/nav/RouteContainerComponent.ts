/**
 * RouteContainerComponent — 路由容器组件
 *
 * 挂载 RouteListenAbility + ChildSlotAbility，
 * 路由变化时根据 path 自动替换内容区域的子组件。
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { RouteListenAbility } from '@qimenjs/router';
import { ChildSlotAbility } from '@qimenjs/component-abilities/render/ChildSlotAbility';

export interface RouteContainerProps {
    routeMap?: Record<string, new (props?: Record<string, any>) => any>;
    defaultComponent?: new (props?: Record<string, any>) => any;
}

const RouteContainerBase = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-route-container',
        children: [{ tag: 'div', name: 'content', cls: 'q-route-container__content' }],
    },
    body: {
        type: 'RouteContainer',

        onInitState() {
            return {
                _routeMap: {} as Record<string, new (props?: Record<string, any>) => any>,
                _defaultComponent: null as (new (props?: Record<string, any>) => any) | null,
            };
        },

        _initRouteContainer(props?: RouteContainerProps): void {
            this.el.classList.add('q-route-container');

            this.logger.debug(
                '[RouteContainer] constructor, routeMap keys =',
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
        },

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
        },
    },
}).with([RouteListenAbility, ChildSlotAbility]);

export let RouteContainerComponent = RouteContainerBase;

export type RouteContainerComponent = InstanceType<typeof RouteContainerBase>;
