import { ButtonComponent } from './ButtonComponent';
import { BUTTON_TPL } from './button-tpl';

export function registerButtonTemplates(): void {
    ButtonComponent.register(BUTTON_TPL);
}
