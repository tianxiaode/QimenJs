/**
 * SelectionAbility 多选集合能力
 *
 * 管理组件的多项选择状态，支持单选/多选/不可选模式。
 * 适用于 Table 行选择、List 项选择、Tree 节点选择等场景。
 *
 * 与 SelectableAbility 的区别：
 * - SelectableAbility：单项选中态（selected: boolean），适用于按钮、Tab、Radio
 * - SelectionAbility：多项集合选择（selectedIds: Set），适用于行/项/节点选择
 *
 * @example
 * ```js
 * // Table 行选择
 * table.selectionMode = 'multi';
 * table.select(rowId);
 * table.selectAll();
 *
 * // 监听选择变化
 * table.onSelectionChange = (data) => { ... };
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SELECTION_EVENTS, ENTITY_EVENTS } from '@qimenjs/events';

export const SelectionAbility: AbilityDefinition = {
    /**
     * 已选中的 ID 集合
     */
    selectedIds: {
        get(): Set<string | number> {
            return this.abilityState('SelectionAbility:selectedIds', () => new Set());
        },
        set(value: Set<string | number>): void {
            this.setAbilityState('SelectionAbility:selectedIds', value);
        },
    },

    /**
     * 选择模式：'single' | 'multi' | 'none'
     */
    selectionMode: {
        get(): string {
            return this.abilityState('SelectionAbility:selectionMode', () => 'multi');
        },
        set(value: string): void {
            this.setAbilityState('SelectionAbility:selectionMode', value);
        },
    },

    /**
     * 是否有选中项
     */
    hasSelection: {
        get(): boolean {
            return this.selectedIds.size > 0;
        },
    },

    /**
     * 选中数量
     */
    selectionCount: {
        get(): number {
            return this.selectedIds.size;
        },
    },

    /**
     * 选中指定 ID
     */
    select(id: string | number): void {
        if (this.selectionMode === 'none') return;

        // 单选模式：先清空
        if (this.selectionMode === 'single' && this.selectedIds.size > 0) {
            this.selectedIds.clear();
        }

        this.selectedIds.add(id);
        this._emitSelectionChange();
    },

    /**
     * 取消选中指定 ID
     */
    deselect(id: string | number): void {
        this.selectedIds.delete(id);
        this._emitSelectionChange();
    },

    /**
     * 切换选中状态
     */
    toggleSelect(id: string | number): void {
        if (this.selectedIds.has(id)) {
            this.deselect(id);
        } else {
            this.select(id);
        }
    },

    /**
     * 判断是否选中
     */
    isSelected(id: string | number): boolean {
        return this.selectedIds.has(id);
    },

    /**
     * 全选（当前数据）
     */
    selectAll(ids?: Array<string | number>): void {
        if (this.selectionMode === 'none' || this.selectionMode === 'single') return;

        if (ids) {
            for (const id of ids) {
                this.selectedIds.add(id);
            }
        } else if (this.mgr?.items) {
            const idField = this.entityConfig?.idField || 'id';
            for (const item of this.mgr.items) {
                this.selectedIds.add(item[idField]);
            }
        }
        this._emitSelectionChange();
    },

    /**
     * 全部取消选中
     */
    deselectAll(): void {
        this.selectedIds.clear();
        this._emitSelectionChange();
    },

    /**
     * 获取选中的 ID 数组
     */
    getSelectedIds(): Array<string | number> {
        return Array.from(this.selectedIds);
    },

    /**
     * 获取选中的数据行
     */
    getSelectedItems(): any[] {
        if (!this.mgr?.items) return [];
        const idField = this.entityConfig?.idField || 'id';
        return this.mgr.items.filter((item: any) => this.selectedIds.has(item[idField]));
    },

    /**
     * 发射选择变更事件
     */
    _emitSelectionChange(): void {
        const data = {
            selectedIds: this.getSelectedIds(),
            selectedItems: this.getSelectedItems(),
            count: this.selectionCount,
        };

        // 钩子：允许修改数据或阻止事件
        if (typeof this.onSelectionChange === 'function') {
            const result = this.onSelectionChange(data);
            if (result === false) return;
        }

        this.emit?.(SELECTION_EVENTS.CHANGE, data);
        this.emit?.(ENTITY_EVENTS.SELECTION_CHANGE, data);
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.selectionMode) this.selectionMode = props.selectionMode;
    },
};
