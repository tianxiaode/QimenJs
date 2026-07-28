import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { ACCORDION_EVENTS } from './accordion-tpl';
import { AccordionComponent } from './AccordionComponent';

export function registerAccordionTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    AccordionComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(ACCORDION_EVENTS);
}
