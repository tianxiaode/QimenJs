import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { NAV_ITEM_TPL } from './nav-item-tpl';
import { ROUTE_CONTAINER_TPL } from './route-container-tpl';

export function registerNavItemTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('NavItem', NAV_ITEM_TPL);
}

export function registerRouteContainerTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('RouteContainer', ROUTE_CONTAINER_TPL);
}
