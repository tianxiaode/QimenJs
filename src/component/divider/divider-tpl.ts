/**
 * Divider 模板定义 — 独立于组件类
 *
 * 通过 ComponentRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const DIVIDER_TPL: TplNode = {
    tag: 'div',
    cls: 'q-divider',
    attrs: { role: 'separator' },
    children: [{ tag: 'span', name: 'text', cls: 'q-divider__text', hidden: true }],
};
