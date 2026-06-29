import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

/**
 * FlatLocalStateAbility - 平铺本地状态能力
 * 
 * 暴露集合相关的状态属性，代理到 state 上
 */
export class FlatLocalStateAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            loading: { get: () => proxy.host.state.loading },
            isEmpty: { get: () => proxy.host.state.items.length === 0 },
            total: { get: () => proxy.host.state.items.length },
            items: { get: () => proxy.host.state.items },
            hasChanges: { get: () => proxy.host.state.hasChanges },
            getDeletionPlan: (ids: (string | number)[]) => proxy.host.state.getDeletionPlan(ids),
            adds: { get: () => proxy.host.state.changes.added },
            updates: { get: () => proxy.host.state.changes.updated },
        };
    }
}
