import type { TplNode } from '@/component-core';
import { PANEL_NAV_CHILDREN } from './panel-nav-tpl';

/** 小时面板模板定义 */
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
