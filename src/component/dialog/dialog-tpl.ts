import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';
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

export const DIALOG_EVENTS: TplEvents = {
    header: {
        toolsLeftClick: { emits: ['headerToolsLeftClick'] },
        toolsRightClick: { emits: ['headerToolsRightClick'] },
        actionClick: { emits: ['headerActionClick'] },
    },
};
