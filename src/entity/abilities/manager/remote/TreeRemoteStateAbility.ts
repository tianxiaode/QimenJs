import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

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
    protected expose(proxy: AbilityProxy): IExposeResult {
        // 注意：不能在 expose() 函数体中直接访问 proxy.host（此时 proxy.host 尚未设置）
        // 必须在返回的 getter/方法闭包内部访问 proxy.host
        return {
            // 每一个属性都通过 get 访问器代理到 state 上
            loading: { get: () => proxy.host.state.loading },
            isEmpty: { get: () => proxy.host.state.items.length === 0 },
            items: { get: () => proxy.host.state.items },
        };
    }
}
