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
import type { FloatDecl } from '@qimenjs/component-core';
import './dropdown.css';

const DEFAULT_POPOVER_FLOAT = {
    trigger: 'click' as const,
    placement: 'bottom' as const,
};

class DropdownComponent extends ButtonComponent {
    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-dropdown');
        this.setNodeHidden(false, 'dropIcon');

        const popover = (this.props as DropdownProps)?.popover;
        if (popover?.type) {
            this.attachFloat('dropIcon', { ...DEFAULT_POPOVER_FLOAT, ...popover } as FloatDecl);
        }
    }

    update(props?: Partial<DropdownProps> & Record<string, any>): void {
        if (props?.popover?.type) {
            this.attachFloat('dropIcon', {
                ...DEFAULT_POPOVER_FLOAT,
                ...props.popover,
            } as FloatDecl);
        }
        super.update(props);
    }
}

export { DropdownComponent };
/** 下拉菜单实例类型 */
export type DropdownComponentInstance = InstanceType<typeof DropdownComponent>;
