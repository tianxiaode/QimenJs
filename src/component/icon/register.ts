import { IconComponent } from './IconComponent';
import { ICON_TPL } from './icon-tpl';

export function registerIconTemplates(): void {
    IconComponent.register(ICON_TPL);
}
