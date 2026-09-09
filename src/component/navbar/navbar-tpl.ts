import type { TemplateDecl } from '@/component-core';

export const NAVBAR_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-navbar',
    children: [
        {
            tag: 'div',
            name: 'menuToggle',
            classes: 'q-navbar__toggle',
            children: [{ tag: 'i', name: 'menuToggleIcon', classes: 'q-navbar__toggle-icon' }],
        },
        { tag: 'div', name: 'logo', classes: 'q-navbar__logo' },
        { tag: 'span', name: 'company', classes: 'q-navbar__company' },
        { tag: 'div', name: 'leftItems', classes: 'q-navbar__left' },
        { tag: 'div', name: 'spacer1', classes: 'q-navbar__spacer q-navbar__spacer--1' },
        { tag: 'div', name: 'centerItems', classes: 'q-navbar__center' },
        { tag: 'div', name: 'spacer2', classes: 'q-navbar__spacer q-navbar__spacer--2' },
        { tag: 'div', name: 'rightItems', classes: 'q-navbar__right' },
    ],
};
