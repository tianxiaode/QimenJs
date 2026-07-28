import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TEXTAREA_FIELD_BODY_TPL } from './textarea-field-body-tpl';

export function registerTextareaFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('TextareaFieldBody', TEXTAREA_FIELD_BODY_TPL);
}
