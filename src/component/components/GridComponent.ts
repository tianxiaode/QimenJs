/**
 * GridComponent 网格布局组件
 *
 * display: grid
 * abilities: [LayoutAbility, ChildrenAbility]
 */

import { ComponentBase } from '../ComponentBase';
import { LayoutAbility } from '../abilities/LayoutAbility';
import { ChildrenAbility } from '../abilities/ChildrenAbility';

export class GridComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility, ChildrenAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-grid';

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
