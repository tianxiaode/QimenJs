import type { TplNode } from '@/component-core';

/** 统计数值模板定义 */
export const STATISTIC_TPL: TplNode = {
    tag: 'div',
    cls: 'q-statistic',
    children: [
        { tag: 'div', name: 'icon', cls: 'q-statistic__icon', hidden: true },
        {
            tag: 'div',
            name: 'content',
            cls: 'q-statistic__content',
            children: [
                { tag: 'div', name: 'title', cls: 'q-statistic__title' },
                {
                    tag: 'div',
                    name: 'valueGroup',
                    cls: 'q-statistic__value-group',
                    children: [
                        { tag: 'span', name: 'prefix', cls: 'q-statistic__prefix', hidden: true },
                        { tag: 'span', name: 'value', cls: 'q-statistic__value' },
                        { tag: 'span', name: 'suffix', cls: 'q-statistic__suffix', hidden: true },
                    ],
                },
                { tag: 'div', name: 'trend', cls: 'q-statistic__trend', hidden: true },
            ],
        },
    ],
};
