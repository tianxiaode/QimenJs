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
    _currentPageClass: any = null;

    onAfterInit(): void {
        const hash = window.location.hash;
        const path = hash ? hash.slice(1) : '';
        const match = this._matchRoute(path);
        if (match) {
            this._mountComponent(match.PageClass);
        } else if (this.defaultComponent) {
            this._mountComponent(this.defaultComponent);
        }
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        const match = this._matchRoute(path);
        if (match) {
            this._mountComponent(match.PageClass);
        }
    }

    private _matchRoute(path: string): { PageClass: any } | null {
        if (!path) return null;
        if (this.routeMap[path]) {
            return { PageClass: this.routeMap[path] };
        }
        const sortedKeys = Object.keys(this.routeMap).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
            if (path.startsWith(key + '/')) {
                return { PageClass: this.routeMap[key] };
            }
        }
        return null;
    }

    private _mountComponent(PageClass: new (props?: Record<string, any>) => any): void {
        if (this._currentPageClass === PageClass) {
            return;
        }
        if (this._currentInstance) {
            this._currentInstance.dispose();
            this._currentInstance = null;
        }
        this._currentPageClass = PageClass;
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
