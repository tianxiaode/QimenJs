import { NavItemComponent } from './NavItemComponent';
import { NavItemGroupComponent } from './NavItemGroupComponent';
import { RouteContainerComponent } from './RouteContainerComponent';
import { NAV_ITEM_TPL } from './nav-item-tpl';
import { ROUTE_CONTAINER_TPL } from './route-container-tpl';

export function registerNavItemTemplates(): void {
    NavItemGroupComponent.register();
    NavItemComponent.register(NAV_ITEM_TPL);
}

export function registerRouteContainerTemplates(): void {
    RouteContainerComponent.register(ROUTE_CONTAINER_TPL);
}
