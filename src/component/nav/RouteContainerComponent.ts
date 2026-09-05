import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { ROUTE_CONTAINER_TPL } from './route-container-tpl';
import './routecontainer.css';

class RouteContainerComponent extends Component {
    static type = 'route-container';
    get tpl(): TemplateDecl {
        return ROUTE_CONTAINER_TPL;
    }

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _routeMap: Record<string, new (props?: Record<string, any>) => any> = {};
    _defaultComponent: (new (props?: Record<string, any>) => any) | null = null;
    _currentInstance: any = null;

    onAfterInit(props?: Record<string, any>): void {
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

export { RouteContainerComponent };
export type RouteContainerComponentInstance = InstanceType<typeof RouteContainerComponent>;
