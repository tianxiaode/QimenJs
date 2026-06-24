"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatRemoteGetAllAbility = void 0;
const composable_1 = require("../../../composable");
class FlatRemoteGetAllAbility extends composable_1.DebounceAbilityBase {
    /**
     * 暴露外部可调用的方法
     *
     * @returns 返回包含 getAll 方法的对象，供外部使用
     */
    expose() {
        const debouncedFetch = this.getDebouncedAction('get-all', this.internalGetAll, 300, true);
        return {
            getAll: () => debouncedFetch(),
        };
    }
    async internalGetAll() {
        const { host } = this;
        const state = host.state;
        const options = await host.buildOptions('get-all', {}, {}, {});
        const context = await host.fetch('get-all', options);
        const items = context.data.list;
        await state.updateData(items, items.length);
        return state.items;
    }
}
exports.FlatRemoteGetAllAbility = FlatRemoteGetAllAbility;
//# sourceMappingURL=FlatRemoteGetAllAbility.js.map