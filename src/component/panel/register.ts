import { PanelComponent } from './PanelComponent';
import { PANEL_TPL } from './panel-tpl';

export function registerPanelTemplates(): void {
    PanelComponent.register(PANEL_TPL);
}
