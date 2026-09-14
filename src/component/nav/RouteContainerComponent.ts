import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { ROUTE_CONTAINER_TPL } from './route-container-tpl';
import './routecontainer.css';

const RouteContainerComponentDefs: Definitions = {
    fields: {
        routeMap: {},
        defaultComponent: undefined,
    },
} as const;

class RouteContainerComponent extends Component {
    static type = 'route-container';
    get tpl(): TemplateDecl {
        return ROUTE_CONTAINER_TPL;
    }

    get earlyOptionKeys(): string[] {
        return [...super.earlyOptionKeys, 'routeMap'];
    }

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _currentInstance: any = null;

    onAfterInit(): void {
        const hash = window.location.hash;
        const path = hash ? hash.slice(1) : '';
        const PageClass = this.routeMap[path] || this.defaultComponent;
        if (PageClass) {
            this._mountComponent(PageClass);
        }
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        const PageClass = this.routeMap[path] || this.defaultComponent;
        if (PageClass) {
            this._mountComponent(PageClass);
        }
    }

    private _mountComponent(PageClass: new (props?: Record<string, any>) => any): void {
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        this._currentInstance = new PageClass({ container: this.el });
    }

    onBeforeDispose(): void {
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        super.onBeforeDispose();
    }
}

RouteContainerComponent.define(RouteContainerComponentDefs);

export { RouteContainerComponent };
