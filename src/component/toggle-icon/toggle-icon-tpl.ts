import type { TemplateDecl } from '@/component-core';

export const TOGGLE_ICON_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-toggle-icon',
    children: [{ tag: 'i', name: 'icon', classes: 'q-toggle-icon__icon' }],
};
