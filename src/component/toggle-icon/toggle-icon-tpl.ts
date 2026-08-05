import type { TplNode } from '@/component-core';

/** 切换图标模板定义 */
export const TOGGLE_ICON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-toggle-icon',
    children: [{ tag: 'i', name: 'icon', cls: 'q-toggle-icon__icon' }],
};
