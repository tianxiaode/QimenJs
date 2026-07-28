import type { TplNode } from '@/component-core/types/tpl-node-types';

import { HeaderComponent } from '../header/HeaderComponent';

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
