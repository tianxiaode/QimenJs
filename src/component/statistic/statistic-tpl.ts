import type { TemplateDecl } from '@/component-core';

export const STATISTIC_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-statistic',
    children: [
        { tag: 'div', name: 'icon', classes: 'q-statistic__icon hidden' },
        {
            tag: 'div',
            name: 'content',
            classes: 'q-statistic__content',
            children: [
                { tag: 'div', name: 'title', classes: 'q-statistic__title' },
                {
                    tag: 'div',
                    name: 'valueGroup',
                    classes: 'q-statistic__value-group',
                    children: [
                        { tag: 'span', name: 'prefix', classes: 'q-statistic__prefix hidden' },
                        { tag: 'span', name: 'value', classes: 'q-statistic__value' },
                        { tag: 'span', name: 'suffix', classes: 'q-statistic__suffix hidden' },
                    ],
                },
                { tag: 'div', name: 'trend', classes: 'q-statistic__trend hidden' },
            ],
        },
    ],
};
