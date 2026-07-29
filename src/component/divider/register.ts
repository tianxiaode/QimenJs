import { DividerComponent } from './DividerComponent';
import { DIVIDER_TPL } from './divider-tpl';

export function registerDividerTemplates(): void {
    DividerComponent.register(DIVIDER_TPL);
}