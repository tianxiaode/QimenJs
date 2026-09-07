import type { TemplateDecl } from '@/component-core';
import { createFormFieldTpl } from '../component/form/formfield-tpl';
import { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';

export const MARKDOWN_EDITOR_TPL: TemplateDecl = createFormFieldTpl(
    MarkdownEditorFieldBodyComponent
);
