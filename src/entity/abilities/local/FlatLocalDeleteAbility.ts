import type { AbilityDefinition } from '@/composable';

/**
 * FlatLocalDeleteAbility - 平铺本地删除能力
 *
 * 提供本地删除能力，自动分流 localOnly 和 persistent 数据。
 * localOnly 数据直接删除，persistent 数据可选立即或延迟同步到远程。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const FlatLocalDeleteAbility: AbilityDefinition = {
    async delete(ids: (string | number)[], immediate: boolean = true) {
        // 1. 获取分流计划
        const plan = this.getDeletionPlan(ids);

        // 2. 执行软删除（保存快照、从 sourceData 移除、记入 changes.deleted）
        await this.softDelete(plan);

        // 3. 处理"持久化"数据的远程同步
        if (plan.persistent.length > 0 && immediate) {
            const options = await this.buildOptions('delete', {}, { ids: plan.persistent }, {});
            await this.fetch('delete', options);
        }

        // 4. 确认删除（清空快照和 changes.deleted）
        await this.confirmDelete();

        this.emit('deleted', ids);
        if (this.refreshView) this.refreshView();

        return plan;
    },
};
