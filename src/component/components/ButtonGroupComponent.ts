/**
 * ButtonGroupComponent 按钮组组件
 *
 * 将多个按钮组合在一起，统一管理尺寸和禁用状态。
 * 子按钮会自动获得按钮组的 size 和 disabled 状态。
 *
 * abilities: [ChildrenAbility, SizeAbility, DisableAbility]
 *
 * @example
 * ```js
 * {
 *   type: ComponentTypes.BUTTON_GROUP, size: 'sm',
 *   children: [
 *     { type: ComponentTypes.BUTTON, text: '左对齐', selectable: true, selectGroup: 'align' },
 *     { type: ComponentTypes.BUTTON, text: '居中', selectable: true, selectGroup: 'align' },
 *     { type: ComponentTypes.BUTTON, text: '右对齐', selectable: true, selectGroup: 'align' },
 *   ]
 * }
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';

export class ButtonGroupComponent extends ComponentBase {
    static override readonly abilities = [ChildrenAbility, SizeAbility, DisableAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('div');
        this.el.className = 'q-button-group q-flex q-flex-row';
        this.el.setAttribute('role', 'group');
    }

    /**
     * 添加子按钮：自动继承按钮组的 size 和 disabled
     */
    addChild(child: any, index?: number): any {
        // 调用 ChildrenAbility 的 addChild
        const list = this.children;
        if (index !== undefined && index >= 0 && index <= list.length) {
            list.splice(index, 0, child);
        } else {
            list.push(child);
        }

        child.parent = this as any;

        // 子按钮继承 size
        if (this.size && typeof child.setSize === 'function') {
            child.setSize(this.size);
        }

        // 子按钮继承 disabled
        if (this.disabled && typeof child.setDisabled === 'function') {
            child.setDisabled(true);
        }

        // 挂载到 DOM
        if (child.el && this.el) {
            if (index !== undefined && index < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[index]);
            } else {
                this.el.appendChild(child.el);
            }
        }

        this.emit?.('childadd', { child, index });
        this.emit?.('childrenchange', { action: 'add', child, index });
        return this;
    }
}
