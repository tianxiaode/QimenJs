/**
 * 状态能力接口
 *
 * 提供组件的响应式更新机制。
 * 通过 markDirty 标记脏状态，微任务内去重调度 update。
 *
 * 不是所有组件都需要此能力：
 * - 需要：ValueAbility、ContentAbility、VirtualListAbility 等会调用 markDirty
 * - 不需要：Separator、Space 等静态组件
 */

export interface IStateAbility {
    /**
     * 更新组件
     *
     * 由子类实现具体更新逻辑。
     * markDirty 调度时自动触发。
     *
     * @param props - 可选的更新属性
     */
    update(props?: Record<string, any>): void;

    /**
     * 标记需要更新
     *
     * 同一微任务内只执行一次 update。
     * 由 ValueAbility、ContentAbility 等在状态变更时调用。
     */
    markDirty(): void;
}
