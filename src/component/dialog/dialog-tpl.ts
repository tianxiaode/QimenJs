import type { TemplateDecl } from '@/component-core';

import { HeaderComponent } from '../header/HeaderComponent';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { ContainerComponent } from '../container/ContainerComponent';

export const DIALOG_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-dialog',
    children: [
        { name: 'header', type: HeaderComponent, classes: 'q-dialog__header' },
        { name: 'body', type: ContainerComponent, classes: 'q-dialog__body' },
        { name: 'footer', type: ItemGroupStaticComponent, classes: 'q-dialog__footer hidden' },
    ],
};
