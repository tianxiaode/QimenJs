/**
 * GridComponent 网格布局容器
 *
 * display: grid
 * abilities: [LayoutAbility, ChildrenAbility, AnimationAbility]
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { AnimationAbility } from '@qimenjs/component-abilities';

export class GridComponent extends ComponentBase {
    static readonly abilities = [LayoutAbility, ChildrenAbility, AnimationAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-grid');

        // 应用网格属性
        if (props?.columns) {
            this.el.style.gridTemplateColumns = props.columns;
        }
        if (props?.rows) {
            this.el.style.gridTemplateRows = props.rows;
        }
        if (props?.gap) {
            this.el.classList.add(`q-gap-${props.gap}`);
        }
    }
}
