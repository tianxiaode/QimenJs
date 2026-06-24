"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteGetAbility = void 0;
const composable_1 = require("../../../composable");
class RemoteGetAbility extends composable_1.AbilityBase {
    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    expose() {
        const { host } = this;
        return {
            /**
             * 远程获取实体
             *
             * @param id 要获取的实体ID
             * @returns Promise<T> 获取的实体的Promise
             */
            get: async (id) => {
                var _a;
                const { idFiled } = host.schemaKeys;
                const options = await host.buildOptions('get', { [idFiled]: id }, null, {});
                // 使用fetch方法发送GET请求
                const context = await host.fetch('get', options);
                // 解析响应数据
                const result = (_a = context.data) === null || _a === void 0 ? void 0 : _a.item;
                // 更新UI状态
                await host.state.updateItem(result);
                return result;
            },
        };
    }
}
exports.RemoteGetAbility = RemoteGetAbility;
//# sourceMappingURL=RemoteGetAbility.js.map