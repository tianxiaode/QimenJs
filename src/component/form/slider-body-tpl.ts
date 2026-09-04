import type { TemplateDecl } from '@/component-core';

export const SLIDER_BODY_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-slider__wrapper',
    attributes: { role: 'slider' },
    children: [
        {
            tag: 'div',
            name: 'track',
            classes: 'q-slider__track',
            children: [
                { tag: 'div', name: 'fill', classes: 'q-slider__fill' },
                { tag: 'div', name: 'thumb', classes: 'q-slider__thumb' },
            ],
        },
        { tag: 'div', name: 'valueLabel', classes: 'q-slider__value' },
    ],
};
