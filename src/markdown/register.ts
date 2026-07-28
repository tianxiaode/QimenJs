/**
 * MarkdownEditorFieldBody 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import {
    MARKDOWN_EDITOR_FIELD_BODY_TPL,
    MARKDOWN_EDITOR_FIELD_BODY_EVENTS,
} from './markdown-editor-field-body-tpl';
import { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';

export function registerMarkdownEditorFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('MarkdownEditorFieldBody', MARKDOWN_EDITOR_FIELD_BODY_TPL);

    MarkdownEditorFieldBodyComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(
        MARKDOWN_EDITOR_FIELD_BODY_EVENTS
    );
}
