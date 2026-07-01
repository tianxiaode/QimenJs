import type { AbilityDefinition } from '@/composable';

/**
 * FlatLocalDeleteAbility - 平铺本地删除能力
 * 
 * 提供本地删除能力，自动分流 localOnly 和 persistent 数据。
 * localOnly 数据直接删除，persistent 数据可选立即或延迟同步到远程。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const FlatLocalDeleteAbility: AbilityDefinition = {
    async delete(ids: (string | number)[], immediate: boolean = true) {
        const { state } = this;

        // 1. 获取分流计划
        const plan = state.getDeletionPlan(ids);

        // 2. 处理"纯本地"数据：直接确认销毁
        if (plan.localOnly.length > 0) {
            state.confirmDelete({ localOnly: plan.localOnly, persistent: [] });
        }

        // 3. 处理"持久化"数据
        if (plan.persistent.length > 0) {
            if (immediate) {
                const options = await this.buildOptions('delete', {}, { ids: plan.persistent }, {});
                await this.fetch('delete', options);
                state.confirmDelete({ localOnly: [], persistent: plan.persistent });
            } else {
                state.confirmDelete({ localOnly: [], persistent: plan.persistent });
            }
        }

        this.emit('deleted', ids);
        if ((state as any).refreshView) (state as any).refreshView();

        return plan;
    },
};
