/**
 * Icon 模板定义 — 独立于组件类
 *
 * 通过 TemplateRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const ICON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-icon-wrap',
    children: [
        {
            tag: 'i',
            name: 'content',
            cls: 'q-icon',
        },
    ],
};
