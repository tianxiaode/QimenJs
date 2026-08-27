import type { TemplateDecl } from '../types';

export const LOADING_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-loading',
    children: [
        { tag: 'div', name: 'spinner', classes: 'q-loading-spinner' },
        { tag: 'div', name: 'text', classes: 'q-loading-text' },
    ],
};
