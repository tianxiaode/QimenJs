import type { TemplateDecl } from '@/component-core';

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import { ButtonComponent } from '../button/ButtonComponent';

export const HEADER_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-header',
    children: [
        { tag: 'i', name: 'icon', classes: 'q-header__icon hidden' },
        { name: 'toolsLeft', type: ItemGroupPooledComponent, classes: 'q-header__tools q-header__tools--left hidden' },
        { tag: 'div', name: 'title', classes: 'q-header__title' },
        { tag: 'span', name: 'subtitle', classes: 'q-header__subtitle hidden' },
        { name: 'toolsRight', type: ItemGroupPooledComponent, classes: 'q-header__tools q-header__tools--right hidden' },
        { name: 'action', type: ButtonComponent, classes: 'q-header__action hidden' },
    ],
};
