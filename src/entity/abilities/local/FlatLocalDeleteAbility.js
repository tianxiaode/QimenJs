"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatLocalDeleteAbility = void 0;
const composable_1 = require("../../../composable");
class FlatLocalDeleteAbility extends composable_1.AbilityBase {
    expose() {
        const { host } = this;
        const { state } = host;
        return {
            /**
             * 独立删除能力
             * @param ids 要删除的 ID 数组
             * @param immediate 是否立即同步到后端（针对已持久化的数据）
             */
            delete: async (ids, immediate = true) => {
                // 1. 获取分流计划
                const plan = state.getDeletionPlan(ids);
                // 2. 处理“纯本地”数据：直接确认销毁（无需请求，无视 immediate）
                if (plan.localOnly.length > 0) {
                    state.confirmDelete({ localOnly: plan.localOnly, persistent: [] });
                }
                // 3. 处理“持久化”数据
                if (plan.persistent.length > 0) {
                    if (immediate) {
                        // A. 立即模式：先调接口，成功后物理移除
                        const options = await host.buildOptions('delete', {}, { ids: plan.persistent }, {});
                        await host.fetch('delete', options);
                        state.confirmDelete({ localOnly: [], persistent: plan.persistent });
                    }
                    else {
                        // B. 延迟模式：这里通常有两种做法
                        // 做法 1：仅记录到 changes.deleted 缓冲区（需要你在 ILocalChangeSet 增加 deleted 数组）
                        // 做法 2：直接物理移除，但保存计划等待 save() 时批量请求
                        state.confirmDelete({ localOnly: [], persistent: plan.persistent });
                        // 记录下这笔“欠账”，方便后续调用 save()
                        // state.changes.deleted.push(...plan.persistent);
                    }
                }
                host.emit('deleted', ids);
                // 如果是树形结构，最后别忘了刷新视图
                if (state.refreshView)
                    state.refreshView();
                return plan;
            },
        };
    }
}
exports.FlatLocalDeleteAbility = FlatLocalDeleteAbility;
//# sourceMappingURL=FlatLocalDeleteAbility.js.map