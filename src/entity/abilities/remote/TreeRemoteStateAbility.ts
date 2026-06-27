import { AbilityBase, type IExposeResult } from '@/composable';

/**
 * TreeRemoteStateAbility - 树形远程状态能力
 *
 * 提供对实体集合的基本访问接口，包括加载状态、项目数量等
 */
export class TreeRemoteStateAbility extends AbilityBase {
    /**
     * 暴露集合相关的状态属性
     *
     * @returns 包含集合状态属性的对象，如加载状态、项目列表等
     */
    protected expose(): IExposeResult {
        const state = this.host.state;

        // 使用基类提供的批量注入方法
        return {
            // 每一个属性都通过 get 访问器代理到 state 上
            loading: { get: () => state.loading },
            isEmpty: { get: () => state.items.length === 0 },
            items: { get: () => state.items },
        };
    }
}
