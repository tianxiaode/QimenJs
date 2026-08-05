import type { TplNode } from '@/component-core';

import { HeaderComponent } from '../header/HeaderComponent';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

/** 对话框模板定义 */
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
        {
            name: 'footer',
            type: ItemGroupStaticComponent,
            cls: 'q-dialog__footer',
            hidden: true,
        },
    ],
};
