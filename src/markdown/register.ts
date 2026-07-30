/**
 * MarkdownEditorFieldBody 模板注册
 */

import { MARKDOWN_EDITOR_FIELD_BODY_TPL } from './markdown-editor-field-body-tpl';
import { MarkdownEditorComponent } from './MarkdownEditorComponent';
import { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';

export function registerMarkdownEditorFieldBodyTemplates(): void {
    MarkdownEditorFieldBodyComponent.register(MARKDOWN_EDITOR_FIELD_BODY_TPL);
    MarkdownEditorComponent.register(MARKDOWN_EDITOR_FIELD_BODY_TPL);
}
