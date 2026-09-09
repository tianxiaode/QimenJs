/**
 * DropdownComponent 下拉组件
 *
 * 带下拉箭头的按钮，浮层默认锚定 dropIcon 节点，trigger='click'，placement='bottom'。
 * 传入 items 时自动生成 popover: { type: 'menu', items } 配置，无需手动声明 popover。
 *
 * @example
 * // items 自动生成菜单
 * new DropdownComponent({
 *     text: '操作',
 *     items: [{ text: '编辑' }, { text: '删除' }],
 * })
 *
 * // 手动指定 popover
 * new DropdownComponent({
 *     text: '更多',
 *     popover: { type: 'Menu', items: [...] },
 * })
 */

import { ButtonComponent } from '../button/ButtonComponent';
import type { Definitions } from '@/composable';
import './dropdown.css';

const DropdownComponentDefs: Definitions = {
    options: {
        items: null,
    },
} as const;

export class DropdownComponent extends ButtonComponent {
    static type = 'dropdown';

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-dropdown');
        this.setNodeHidden(false, 'dropIcon');
        if (this.items && !this.popover) {
            this.popover = { type: 'menu', items: this.items };
        }
    }

    _onItemsOptionChange(value: any): void {
        if (value && !this.popover) {
            this.popover = { type: 'menu', items: value };
        } else if (this.popover && (this.popover as any).type === 'menu') {
            this.popover = { ...(this.popover as any), items: value };
        }
    }
}

DropdownComponent.define(DropdownComponentDefs);
