import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { NAV_ITEM_TPL, NAV_ITEM_EVENTS } from './nav-item-tpl';
import { NavItemComponent } from './NavItemComponent';
import { ROUTE_CONTAINER_TPL, ROUTE_CONTAINER_EVENTS } from './route-container-tpl';
import { RouteContainerComponent } from './RouteContainerComponent';

export function registerNavItemTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('NavItem', NAV_ITEM_TPL);
    NavItemComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(NAV_ITEM_EVENTS);
}

export function registerRouteContainerTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('RouteContainer', ROUTE_CONTAINER_TPL);
    RouteContainerComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(ROUTE_CONTAINER_EVENTS);
}
