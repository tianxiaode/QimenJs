import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { ALERT_TPL, ALERT_EVENTS } from './alert-tpl';
import { AlertComponent } from './AlertComponent';

export function registerAlertTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Alert', ALERT_TPL);
    AlertComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(ALERT_EVENTS);
}
