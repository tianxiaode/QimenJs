import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';
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

export const PANEL_EVENTS: TplEvents = {
    header: {
        toolsLeftClick: { emits: ['headerToolsLeftClick'] },
        toolsRightClick: { emits: ['headerToolsRightClick'] },
        actionClick: { emits: ['headerActionClick'] },
    },
};
