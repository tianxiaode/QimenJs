import type { TemplateDecl } from '@/component-core';
import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';

/** 面板模板定义 */
export const PANEL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-panel',
    children: [
        {
            tag: 'div',
            classes: 'q-panel__header',
            children: [
                { name: 'toolsLeft', type: ItemGroupPooledComponent },
                { tag: 'div', name: 'title', classes: 'q-panel__title' },
                { name: 'toolsRight', type: ItemGroupPooledComponent },
                { tag: 'i', name: 'expandAction', classes: 'q-panel__expand hidden' },
                { tag: 'i', name: 'closeAction', classes: 'q-panel__close hidden' },
            ],
        },
        { tag: 'div', name: 'body', classes: 'q-panel__body' },
    ],
};