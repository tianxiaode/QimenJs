/**
 * VBoxComponent 垂直布局组件
 *
 * display: flex; flex-direction: column
 * abilities: [LayoutAbility, ChildrenAbility]
 */

import { ComponentBase } from '../ComponentBase';
import { LayoutAbility } from '../abilities/LayoutAbility';
import { ChildrenAbility } from '../abilities/ChildrenAbility';

export class VBoxComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility, ChildrenAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-vbox q-flex q-flex-col';

        // 应用布局属性
        if (props?.gap) this.el.classList.add(`q-gap-${props.gap}`);
        if (props?.align) this.el.classList.add(`q-items-${props.align}`);
        if (props?.justify) this.el.classList.add(`q-justify-${props.justify}`);
    }
}
