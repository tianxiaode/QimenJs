import type { TplNode } from '@/component-core/types/tpl-node-types';

import { HeaderComponent } from '../header/HeaderComponent';

export const DIALOG_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dialog',
    children: [
        {
            name: 'header',
            type: HeaderComponent,
            cls: 'q-dialog__header',
        },
        { tag: 'div', name: 'body', cls: 'q-dialog__body' },
    ],
};
