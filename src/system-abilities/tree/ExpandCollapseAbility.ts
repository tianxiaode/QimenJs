/**
 * ExpandCollapseAbility — 展开/折叠状态管理能力
 *
 * 为树形组件（tree-nav、tree-grid 等）提供统一的展开/折叠状态管理：
 * - expanded option 变化时自动切换 CSS class（{prefix}--expanded）
 * - 触发 expand/collapse 事件
 * - 组件通过 _onExpandedChange(value) 回调处理 DOM 特定逻辑
 *
 * 使用方式：
 * 1. 组件 use(ExpandCollapseAbility)
 * 2. 组件 Definitions 中定义 expanded option（默认 false）
 * 3. 组件实现 _onExpandedChange(value) 回调处理 DOM
 * 4. 组件自己实现 expand()/collapse()/toggleExpand() 方法（含前置条件检查）
 *    内部通过设置 this.expanded = true/false 触发状态变更
 *
 * @example
 * ```ts
 * TreeNavItemComponent.use(ExpandCollapseAbility);
 *
 * // 组件中
 * expand(): void {
 *     if (this.expanded) return;
 *     if (!this.children?.length) return;
 *     this.expanded = true; // 触发 _onExpandedOptionChange
 * }
 *
 * _onExpandedChange(value: boolean): void {
 *     // DOM 特定逻辑
 *     if (value) this._renderChildren();
 *     else this._clearChildren();
 * }
 * ```
 */

import type { AbilityDefinition } from '@/composable';

export const ExpandCollapseAbility = {
    _onExpandedOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--expanded`;
        value ? this.addCls(cls) : this.removeCls(cls);
        if (typeof (this as any)._onExpandedChange === 'function') {
            (this as any)._onExpandedChange(value);
        }
        this.emit(value ? 'expand' : 'collapse', { item: this });
    },
} satisfies AbilityDefinition;
