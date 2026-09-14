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
        if (this.defaultComponent) {
            this._mountComponent(this.defaultComponent);
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
    }

    onRouteChange(event: any): void {
        console.log('[RouteContainer] onRouteChange, event=', JSON.stringify(event), 'routeMap keys=', Object.keys(this.routeMap));
        const path = event?.path;
        const PageClass = this.routeMap[path] || this.defaultComponent;
        console.log('[RouteContainer] path=', path, 'PageClass=', PageClass?.name);
        if (PageClass) {
            this._mountComponent(PageClass);
        }
    }

    private _mountComponent(PageClass: new (props?: Record<string, any>) => any): void {
        console.log('[RouteContainer] _mountComponent, PageClass=', PageClass?.name, 'hasEl=', !!this.el);
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        this._currentInstance = new PageClass({ container: this.el });
        console.log('[RouteContainer] _mountComponent done, instance el=', !!this._currentInstance?.el);
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
