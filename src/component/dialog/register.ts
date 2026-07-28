import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { DIALOG_TPL } from './dialog-tpl';

export function registerDialogTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Dialog', DIALOG_TPL);
}
