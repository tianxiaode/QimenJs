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
        this._currentInstance = new PageClass({ parent: this });
        if (this.el) this.el.appendChild(this._currentInstance.el);
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
export type RouteContainerComponentInstance = InstanceType<typeof RouteContainerComponent>;
