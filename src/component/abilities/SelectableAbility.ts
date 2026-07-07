/**
 * SelectableAbility 选中态能力
 *
 * 管理组件的选中状态，支持单选/多选/互斥组。
 * 适用于工具栏按钮（加粗/斜体）、Tab 切换、Radio 等场景。
 *
 * @example
 * ```js
 * // 工具栏按钮 - toggle 选中
 * boldBtn.selectable = true;
 * boldBtn.selected = true;
 *
 * // 互斥组 - 同组只能选中一个
 * alignLeftBtn.selectGroup = 'align';
 * alignCenterBtn.selectGroup = 'align';
 * alignRightBtn.selectGroup = 'align';
 *
 * // 监听选中变化
 * btn.onSelectChange = (selected) => { ... };
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SELECTION_EVENTS } from '../events';

export const SelectableAbility: AbilityDefinition = {
    /**
     * selectable getter/setter - 是否可选中
     */
    selectable: {
        get(): boolean {
            return this.abilityState('SelectableAbility:selectable', () => false);
        },
        set(value: boolean): void {
            this.setAbilityState('SelectableAbility:selectable', value);
        },
    },

    /**
     * selected getter/setter - 是否已选中
     */
    selected: {
        get(): boolean {
            return this.abilityState('SelectableAbility:selected', () => false);
        },
        set(value: boolean): void {
            const old = this.selected;
            if (old === value) return;
            this.setAbilityState('SelectableAbility:selected', value);

            // 更新 DOM
            if (this.el) {
                if (value) {
                    this.addClass(`q-${this.type}--selected`);
                    this.el.setAttribute('aria-pressed', 'true');
                } else {
                    this.removeClass(`q-${this.type}--selected`);
                    this.el.setAttribute('aria-pressed', 'false');
                }
            }

            // 互斥组：取消同组其他组件的选中
            if (value && this.selectGroup) {
                this._deselectSiblings();
            }

            // 回调
            if (typeof this.onSelectChange === 'function') {
                this.onSelectChange(value);
            }

            this.emit?.(SELECTION_EVENTS.CHANGE, { selected: value });
        },
    },

    /**
     * selectGroup getter/setter - 互斥组名
     *
     * 同一 selectGroup 内只能有一个组件处于 selected 状态
     */
    selectGroup: {
        get(): string {
            return this.abilityState('SelectableAbility:selectGroup', () => '');
        },
        set(value: string): void {
            this.setAbilityState('SelectableAbility:selectGroup', value);
        },
    },

    /**
     * 选中变化回调
     */
    onSelectChange: {
        get(): ((selected: boolean) => void) | undefined {
            return this.abilityState('SelectableAbility:onSelectChange', () => undefined);
        },
        set(handler: (selected: boolean) => void): void {
            this.setAbilityState('SelectableAbility:onSelectChange', handler);
        },
    },

    /**
     * 切换选中状态
     */
    toggle(): void {
        if (this.selectable) {
            this.selected = !this.selected;
        }
    },

    /**
     * 选中
     */
    select(): void {
        if (this.selectable) {
            this.selected = true;
        }
    },

    /**
     * 取消选中
     */
    deselect(): void {
        if (this.selectable) {
            this.selected = false;
        }
    },

    /**
     * 互斥组内取消同组其他组件的选中
     */
    _deselectSiblings(): void {
        const group = this.selectGroup;
        if (!group || !this.parent) return;

        // 遍历父组件的子组件
        if (typeof this.parent.eachChild === 'function') {
            this.parent.eachChild((child: any) => {
                if (child !== this && child.selectGroup === group && child.selected) {
                    // 直接设置状态，不触发互斥递归
                    child.setAbilityState('SelectableAbility:selected', false);
                    if (child.el) {
                        child.removeClass(`q-${child.type}--selected`);
                        child.el.setAttribute('aria-pressed', 'false');
                    }
                    if (typeof child.onSelectChange === 'function') {
                        child.onSelectChange(false);
                    }
                    child.emit?.(SELECTION_EVENTS.CHANGE, { selected: false });
                }
            });
        }
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.selectable) this.selectable = true;
        if (props.selected) this.selected = true;
        if (props.selectGroup) this.selectGroup = props.selectGroup;
    },
};
