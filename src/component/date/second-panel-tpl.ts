import type { TplNode } from '@/component-core/types/tpl-node-types';

export const SECOND_PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-dtpanel__nav',
            children: [
                { tag: 'button', name: 'backBtn', cls: 'q-dtpanel__nav-btn', i18n: 'back' },
                { tag: 'button', name: 'prevBtn', cls: 'q-dtpanel__nav-btn', i18n: 'prev' },
                {
                    tag: 'span',
                    name: 'title',
                    cls: 'q-dtpanel__nav-title',
                    i18n: 'selectSecond',
                },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-confirm',
                    i18n: 'confirm',
                },
            ],
        },
        {
            tag: 'div',
            name: 'tensRow',
            cls: 'q-dtpanel__high-row',
        },
        {
            tag: 'div',
            name: 'onesGrid',
            cls: 'q-dtpanel__grid',
            style: 'grid-template-columns: repeat(2, 1fr); padding-left: 24px; padding-right: 24px;',
        },
    ],
};
