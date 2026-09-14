import type { TemplateDecl } from '@/component-core';

/** 开关模板定义：根节点即椭圆轨道，thumb 为滑块 */
export const SWITCH_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-switch',
    children: [{ tag: 'span', name: 'thumb', classes: 'q-switch__thumb' }],
};
