import type { TemplateDecl } from '@/component-core';
import { PANEL_NAV_CHILDREN } from './panel-nav-tpl';

/** 小时面板模板定义 */
export const HOUR_PANEL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            classes: 'q-dtpanel__nav',
            children: PANEL_NAV_CHILDREN,
        },
        {
            tag: 'div',
            name: 'grid',
            classes: 'q-dtpanel__grid',
            style: {
                'grid-template-columns': 'repeat(4, 1fr);',
            },
        },
    ],
};
