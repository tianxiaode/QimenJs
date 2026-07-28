import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { DIALOG_TPL, DIALOG_EVENTS } from './dialog-tpl';
import { DialogComponent } from './DialogComponent';

export function registerDialogTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Dialog', DIALOG_TPL);
    DialogComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(DIALOG_EVENTS);
}
