import type { TplNode } from '@/component-core';

import { HeaderComponent } from '../header/HeaderComponent';

/** 面板模板定义 */
export const PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-panel',
    children: [
        {
            name: 'header',
            type: HeaderComponent,
            cls: 'q-panel__header',
        },
        { tag: 'div', name: 'body', cls: 'q-panel__body' },
    ],
};
