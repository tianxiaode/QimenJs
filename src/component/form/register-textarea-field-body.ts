import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TEXTAREA_FIELD_BODY_TPL, TEXTAREA_FIELD_BODY_EVENTS } from './textarea-field-body-tpl';
import { TextareaFieldBodyComponent } from './TextareaFieldBodyComponent';

export function registerTextareaFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('TextareaFieldBody', TEXTAREA_FIELD_BODY_TPL);
    TextareaFieldBodyComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(
        TEXTAREA_FIELD_BODY_EVENTS
    );
}
