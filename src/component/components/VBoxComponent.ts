/**
 * VBoxComponent 垂直布局容器
 *
 * display: flex; flex-direction: column
 * abilities: [LayoutAbility, ChildrenAbility, AnimationAbility]
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';

export class VBoxComponent extends ComponentBase {
    static readonly abilities = [LayoutAbility, ChildrenAbility, AnimationAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-vbox', 'q-flex', 'q-flex-col');

        // 应用布局属性
        if (props?.gap) this.el.classList.add(`q-gap-${props.gap}`);
        if (props?.align) this.el.classList.add(`q-items-${props.align}`);
        if (props?.justify) this.el.classList.add(`q-justify-${props.justify}`);
    }
}
