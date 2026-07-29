import { ToggleIconComponent } from './ToggleIconComponent';
import { TOGGLE_ICON_TPL } from './toggle-icon-tpl';

export function registerToggleIconTemplates(): void {
    ToggleIconComponent.register(TOGGLE_ICON_TPL);
}