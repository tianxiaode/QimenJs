import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteStateAbility - 扁平远程状态能力
 *
 * 提供对实体集合的基本访问接口，包括加载状态、项目数量、分页信息等。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const FlatRemoteStateAbility: AbilityDefinition = {
    loading: { get() { return this.state.loading; } },
    isEmpty: { get() { return this.state.items.length === 0; } },
    hasMore: { get() { return this.state.page < this.state.pages; } },
    total: { get() { return this.state.total; } },
    items: { get() { return this.state.items; } },
    page: { get() { return this.state.page; } },
    pageSize: { get() { return this.state.pageSize; } },
    pages: { get() { return this.state.pages; } },
    pageSizes: { get() { return this.state.pageSizes; } },
    isDirty(currentItem: any) { return this.state.isDirty(currentItem); },
    edit(item: any) { return this.state.edit(item); },
    rollback() { return this.state.rollback(); },
};
