import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { INPUT_FIELD_BODY_TPL } from './input-field-body-tpl';

export function registerInputFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('InputFieldBody', INPUT_FIELD_BODY_TPL);
}
