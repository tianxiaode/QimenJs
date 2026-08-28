import type { TemplateDecl } from '../types';

export const TOOLTIP_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-tooltip',
    children: [
        { tag: 'span', name: 'text', classes: 'q-tooltip__content' },
        { tag: 'div', name: 'arrow', classes: 'q-arrow' },
    ],
};
