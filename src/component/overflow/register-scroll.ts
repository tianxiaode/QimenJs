import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { OVERFLOW_SCROLL_TPL, OVERFLOW_SCROLL_EVENTS } from './overflow-scroll-tpl';
import { OverflowScrollComponent } from './OverflowScrollComponent';

export function registerOverflowScrollTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('OverflowScroll', OVERFLOW_SCROLL_TPL);
    OverflowScrollComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(OVERFLOW_SCROLL_EVENTS);
}
