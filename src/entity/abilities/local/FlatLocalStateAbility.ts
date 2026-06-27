import { AbilityBase, type IExposeResult } from '@/composable';

/**
 * FlatLocalStateAbility - 平铺本地状态能力
 * 
 * 暴露集合相关的状态属性，代理到 state 上
 */
export class FlatLocalStateAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            loading: { get: () => this.host.state.loading },
            isEmpty: { get: () => this.host.state.items.length === 0 },
            total: { get: () => this.host.state.items.length },
            items: { get: () => this.host.state.items },
            hasChanges: { get: () => this.host.state.hasChanges },
            getDeletionPlan: (ids: (string | number)[]) => this.host.state.getDeletionPlan(ids),
            adds: { get: () => this.host.state.changes.added },
            updates: { get: () => this.host.state.changes.updated },
        };
    }
}
