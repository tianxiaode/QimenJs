import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { INDICATOR_TPL, INDICATOR_EVENTS } from './indicator-tpl';
import { IndicatorComponent } from './IndicatorComponent';

export function registerIndicatorTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Indicator', INDICATOR_TPL);
    IndicatorComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(INDICATOR_EVENTS);
}
