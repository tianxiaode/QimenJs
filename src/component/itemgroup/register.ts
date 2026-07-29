import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';
import { ITEMGROUP_BASE_TPL } from './itemgroup-tpl';
import { ItemGroupPooledComponent } from './ItemGroupPooledComponent';
import { ItemGroupStaticComponent } from './ItemGroupStaticComponent';

export function registerItemGroupTemplates(): void {
    ItemGroupBaseComponent.register(ITEMGROUP_BASE_TPL);
    ItemGroupPooledComponent.register();
    ItemGroupStaticComponent.register();
}
