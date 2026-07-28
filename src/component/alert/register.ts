import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { ALERT_TPL } from './alert-tpl';

export function registerAlertTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Alert', ALERT_TPL);
}
