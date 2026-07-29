import { OverflowScrollComponent } from './OverflowScrollComponent';
import { OVERFLOW_SCROLL_TPL } from './overflow-scroll-tpl';

export function registerOverflowScrollTemplates(): void {
    OverflowScrollComponent.register(OVERFLOW_SCROLL_TPL);
}