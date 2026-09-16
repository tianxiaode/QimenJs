import type { TemplateDecl } from '@/component-core';
import { HeaderComponent } from '../header/HeaderComponent';

export const PANEL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-panel',
    children: [
        { name: 'header', type: HeaderComponent, classes: 'q-panel__header' },
        { tag: 'div', name: 'body', classes: 'q-panel__body' },
    ],
};
