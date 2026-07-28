import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { HEADER_TPL, HEADER_EVENTS } from './header-tpl';
import { HeaderComponent } from './HeaderComponent';

export function registerHeaderTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Header', HEADER_TPL);
    HeaderComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(HEADER_EVENTS);
}
