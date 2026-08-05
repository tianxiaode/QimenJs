import type { TplNode } from '@/component-core';
import { PANEL_NAV_CHILDREN } from './panel-nav-tpl';

/** 年份面板模板定义 */
export const YEAR_PANEL_TPL: TplNode = {
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
            name: 'digitColumns',
            cls: 'q-dtpanel__digit-columns',
        },
    ],
};
