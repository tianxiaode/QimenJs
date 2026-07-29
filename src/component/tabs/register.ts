import { TabsComponent } from './TabsComponent';
import { TABS_TPL } from './tabs-tpl';

export function registerTabsTemplates(): void {
    TabsComponent.register(TABS_TPL);
}