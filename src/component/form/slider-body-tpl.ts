/**
 * SliderFieldBody 模板定义
 *
 * 结构：track（轨道） > fill（已填充） + thumb（滑块）
 * value 显示在 thumb 上方或右侧
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const SLIDER_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-slider__wrapper',
    attrs: { role: 'slider' },
    children: [
        {
            tag: 'div',
            name: 'track',
            cls: 'q-slider__track',
            children: [
                { tag: 'div', name: 'fill', cls: 'q-slider__fill' },
                { tag: 'div', name: 'thumb', cls: 'q-slider__thumb' },
            ],
        },
        { tag: 'div', name: 'valueLabel', cls: 'q-slider__value' },
    ],
};
