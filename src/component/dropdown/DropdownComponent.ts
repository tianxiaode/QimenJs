/**
 * DropdownComponent 下拉组件
 *
 * 带下拉箭头的按钮，浮层默认锚定 dropIcon 节点，trigger='click'，placement='bottom'。
 * 使用方只需传入 popover 指定浮层类型和数据，与默认值自动合并。
 *
 * @example
 * new DropdownComponent({
 *     text: '操作',
 *     popover: { type: 'Menu', items: [...] },
 * })
 *
 * // 自定义触发方式和事件转发
 * new DropdownComponent({
 *     text: '更多',
 *     popover: {
 *         type: 'Popover',
 *         trigger: 'hover',
 *         placement: 'right',
 *         emits: { shown: 'dropOpen', hidden: 'dropClose' },
 *     },
 * })
 */

import { ButtonComponent } from '../button/ButtonComponent';
import './dropdown.css';

export class DropdownComponent extends ButtonComponent {
    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-dropdown');
        this.setNodeHidden(false, 'dropIcon');
    }
}
