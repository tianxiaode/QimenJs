import type { TemplateDecl } from '@/component-core';
import { createCellTpl } from './base-cell-tpl';

export const EXPAND_CELL_TPL: TemplateDecl = createCellTpl({
    tag: 'span',
    name: 'icon',
    classes: 'q-expand-icon',
});
