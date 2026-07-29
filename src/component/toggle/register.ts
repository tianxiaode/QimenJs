import { ToggleComponent } from './ToggleComponent';
import { TOGGLE_TPL } from './toggle-tpl';

export function registerToggleTemplates(): void {
    ToggleComponent.register(TOGGLE_TPL);
}