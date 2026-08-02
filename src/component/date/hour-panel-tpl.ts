import type { TplNode } from '@/component-core/types/tpl-node-types';
import { PANEL_NAV_CHILDREN } from './panel-nav-tpl';

export const HOUR_PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-dtpanel__nav',
            children: PANEL_NAV_CHILDREN,
        },
        {
            tag: 'div',
            name: 'grid',
            cls: 'q-dtpanel__grid',
            style: 'grid-template-columns: repeat(4, 1fr);',
        },
    ],
};
