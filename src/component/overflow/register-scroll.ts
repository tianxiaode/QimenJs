import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { OVERFLOW_SCROLL_TPL } from './overflow-scroll-tpl';

export function registerOverflowScrollTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('OverflowScroll', OVERFLOW_SCROLL_TPL);
}
