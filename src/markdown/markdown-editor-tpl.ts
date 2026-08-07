import type { TplNode } from '@/component-core';
import { createFormFieldTpl } from '../component/form/formfield-tpl';
import { MarkdownEditorFieldBodyComponent } from './MarkdownEditorFieldBodyComponent';

export const MARKDOWN_EDITOR_TPL: TplNode = createFormFieldTpl(MarkdownEditorFieldBodyComponent);
