import type { TplNode } from '@/component-core/types/tpl-node-types';

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import { ButtonComponent } from '../button/ButtonComponent';

export const HEADER_TPL: TplNode = {
    tag: 'div',
    cls: 'q-header',
    flex: { direction: 'row', align: 'center', gap: '8px' },
    children: [
        {
            tag: 'i',
            name: 'icon',
            cls: 'q-header__icon',
            hidden: true,
        },
        {
            name: 'toolsLeft',
            type: ItemGroupPooledComponent,
            cls: 'q-header__tools q-header__tools--left',
            hidden: true,
        },
        { tag: 'div', name: 'title', cls: 'q-header__title' },
        { tag: 'span', name: 'subtitle', cls: 'q-header__subtitle', hidden: true },
        {
            name: 'toolsRight',
            type: ItemGroupPooledComponent,
            cls: 'q-header__tools q-header__tools--right',
            hidden: true,
        },
        { name: 'action', type: ButtonComponent, cls: 'q-header__action', hidden: true },
    ],
};
