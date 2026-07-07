/**
 * HBoxComponent 水平布局容器
 *
 * display: flex; flex-direction: row
 * abilities: [LayoutAbility, ChildrenAbility, AnimationAbility]
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';

export class HBoxComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility, ChildrenAbility, AnimationAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-hbox q-flex q-flex-row';

        // 应用布局属性
        if (props?.gap) this.el.classList.add(`q-gap-${props.gap}`);
        if (props?.align) this.el.classList.add(`q-items-${props.align}`);
        if (props?.justify) this.el.classList.add(`q-justify-${props.justify}`);
    }
}
