import type { AbilityDefinition } from '@/composable';

/**
 * FlatLocalStateAbility - 平铺本地状态能力
 * 
 * 暴露集合相关的状态属性，代理到 state 上。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const FlatLocalStateAbility: AbilityDefinition = {
    loading: { get() { return this.state.loading; } },
    isEmpty: { get() { return this.state.items.length === 0; } },
    total: { get() { return this.state.items.length; } },
    items: { get() { return this.state.items; } },
    hasChanges: { get() { return this.state.hasChanges; } },
    getDeletionPlan(ids: (string | number)[]) { return this.state.getDeletionPlan(ids); },
    adds: { get() { return this.state.changes.added; } },
    updates: { get() { return this.state.changes.updated; } },
};
