import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { SWITCH_FIELD_BODY_TPL } from './switch-field-body-tpl';

export function registerSwitchFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('SwitchFieldBody', SWITCH_FIELD_BODY_TPL);
}
