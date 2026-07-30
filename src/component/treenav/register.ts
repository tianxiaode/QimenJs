import { TreeNavComponent } from './TreeNavComponent';
import { TreeNavItemComponent } from './TreeNavItemComponent';
import { TREE_NAV_ITEM_TPL } from './tree-nav-item-tpl';

export function registerTreeNavTemplates(): void {
    TreeNavComponent.register();
    TreeNavItemComponent.register(TREE_NAV_ITEM_TPL);
}
