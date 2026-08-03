/**
 * Text 模板定义 — 独立于组件类
 *
 * 通过 ComponentRegistrar 注册，编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core';

export const TEXT_TPL: TplNode = {
    tag: 'span',
    name: 'content',
    cls: 'q-text',
};
