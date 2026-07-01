import type { AbilityDefinition } from '@/composable';

/**
 * TreeRemoteStateAbility - 树形远程状态能力
 *
 * 提供对实体集合的基本访问接口，包括加载状态、项目数量等。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const TreeRemoteStateAbility: AbilityDefinition = {
    loading: { get() { return this.state.loading; } },
    isEmpty: { get() { return this.state.items.length === 0; } },
    items: { get() { return this.state.items; } },
};
