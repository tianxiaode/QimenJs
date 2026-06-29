import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

/**
 * FlatLocalDeleteAbility - 平铺本地删除能力
 * 
 * 提供本地删除能力，自动分流 localOnly 和 persistent 数据。
 * localOnly 数据直接删除，persistent 数据可选立即或延迟同步到远程。
 */
export class FlatLocalDeleteAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            delete: async (ids: (string | number)[], immediate: boolean = true) => {
                const host = proxy.host;
                const { state } = host;

                // 1. 获取分流计划
                const plan = state.getDeletionPlan(ids);

                // 2. 处理"纯本地"数据：直接确认销毁
                if (plan.localOnly.length > 0) {
                    state.confirmDelete({ localOnly: plan.localOnly, persistent: [] });
                }

                // 3. 处理"持久化"数据
                if (plan.persistent.length > 0) {
                    if (immediate) {
                        const options = await host.buildOptions('delete', {}, { ids: plan.persistent }, {});
                        await host.fetch('delete', options);
                        state.confirmDelete({ localOnly: [], persistent: plan.persistent });
                    } else {
                        state.confirmDelete({ localOnly: [], persistent: plan.persistent });
                    }
                }

                host.emit('deleted', ids);
                if ((state as any).refreshView) (state as any).refreshView();

                return plan;
            },
        };
    }
}
