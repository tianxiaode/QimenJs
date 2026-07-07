/**
 * ToolbarComponent 工具栏组件
 *
 * 水平排列的工具栏容器，用于放置按钮、按钮组、分隔符等。
 * 本质是带 gap 的 HBox，但语义化为工具栏。
 *
 * abilities: [LayoutAbility, ChildrenAbility, AnimationAbility]
 *
 * @example
 * ```js
 * {
 *   type: 'Toolbar', gap: 'sm',
 *   children: [
 *     { type: 'Button', text: '新建', icon: '📄' },
 *     { type: 'Button', text: '保存', icon: '💾' },
 *     { type: 'Separator' },
 *     { type: 'ButtonGroup', children: [
 *       { type: 'Button', text: 'B', selectable: true, selectGroup: 'format' },
 *       { type: 'Button', text: 'I', selectable: true, selectGroup: 'format' },
 *       { type: 'Button', text: 'U', selectable: true, selectGroup: 'format' },
 *     ]},
 *   ]
 * }
 * ```
 */

import { ComponentBase } from '../ComponentBase';
import { LayoutAbility } from '../abilities/LayoutAbility';
import { ChildrenAbility } from '../abilities/ChildrenAbility';
import { AnimationAbility } from '../abilities/AnimationAbility';

export class ToolbarComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility, ChildrenAbility, AnimationAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-toolbar q-flex q-flex-row';
        this.el.setAttribute('role', 'toolbar');

        // 应用布局属性
        if (props?.gap) this.el.classList.add(`q-gap-${props.gap}`);
        if (props?.align) this.el.classList.add(`q-items-${props.align}`);
        if (props?.justify) this.el.classList.add(`q-justify-${props.justify}`);
    }
}
