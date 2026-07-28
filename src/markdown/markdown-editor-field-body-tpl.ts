/**
 * MarkdownEditorFieldBody 模板定义
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const MARKDOWN_EDITOR_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-md-editor__wrapper',
    children: [
        {
            tag: 'textarea',
            name: 'editor',
            cls: 'q-md-editor__input',
        },
        {
            tag: 'div',
            name: 'preview',
            cls: 'q-md-editor__preview q-md-viewer',
        },
    ],
};

export const MARKDOWN_EDITOR_FIELD_BODY_EVENTS: TplEvents = {
    editor: {
        input: { emits: ['input'], debounce: 150 },
        focus: { emits: ['focus'] },
        blur: { emits: ['blur'] },
        change: { emits: ['change'], debounce: 150 },
        keydown: { emits: ['keydown'] },
    },
};
