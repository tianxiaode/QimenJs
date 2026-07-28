/**
 * MarkdownEditorFieldBody 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { MARKDOWN_EDITOR_FIELD_BODY_TPL } from './markdown-editor-field-body-tpl';

export function registerMarkdownEditorFieldBodyTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('MarkdownEditorFieldBody', MARKDOWN_EDITOR_FIELD_BODY_TPL);
}
