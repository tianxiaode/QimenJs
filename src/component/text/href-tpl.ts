/**
 * Href 模板定义 — 独立于组件类
 *
 * 根节点 <a> 自动注册为 'root'，通过 ComponentRegistrar 注册，
 * 编译产物缓存于注册表。
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const HREF_TPL: TplNode = {
    tag: 'a',
    cls: 'q-href',
};
