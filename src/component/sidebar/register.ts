import { SidebarComponent } from './SidebarComponent';
import { SIDEBAR_TPL } from './sidebar-tpl';

export function registerSidebarTemplates(): void {
    SidebarComponent.register(SIDEBAR_TPL);
}