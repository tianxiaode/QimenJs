"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatLocalStateAbility = void 0;
const composable_1 = require("../../../composable");
class FlatLocalStateAbility extends composable_1.AbilityBase {
    /**
     * 暴露集合相关的状态属性
     *
     * @returns 包含集合状态属性的对象，如加载状态、项目列表、分页信息等
     */
    expose() {
        const { state, logger } = this.host;
        // 使用基类提供的批量注入方法
        return {
            // 每一个属性都通过 get 访问器代理到 state 上
            loading: { get: () => state.loading },
            isEmpty: { get: () => state.items.length === 0 },
            total: { get: () => state.items.length },
            items: { get: () => state.items },
            hasChanges: { get: () => state.hasChanges },
            getDeletionPlan: (ids) => state.getDeletionPlan(ids),
            adds: { get: () => state.changes.added },
            updates: { get: () => state.changes.updated },
        };
    }
}
exports.FlatLocalStateAbility = FlatLocalStateAbility;
//# sourceMappingURL=FlatLocalStateAbility.js.map