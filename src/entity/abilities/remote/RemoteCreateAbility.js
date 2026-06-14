"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteCreateAbility = void 0;
/**
 * RemoteCreateAbility - 远程创建能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求创建远程数据的功能。
 * 它封装了发送创建请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
const composable_1 = require("../../../composable");
const EntityError_1 = require("../../../errors/EntityError");
const codes_1 = require("../../../errors/codes");
class RemoteCreateAbility extends composable_1.AbilityBase {
    /**
     * 暴露远程创建操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 create 方法。
     *
     * @returns 返回一个包含异步 create 方法的对象，该方法可用于执行创建操作。
     */
    expose() {
        const { host } = this;
        return {
            /**
             * 创建一条新记录
             *
             * 发送请求以在服务器上创建新记录，并自动同步创建结果到本地状态。
             *
             * @param {Partial<T>} data - 包含待创建记录所需字段的对象
             * @returns {Promise<T>} 一个 Promise，解析为服务器返回的、已创建后的完整记录。
             * @throws {EntityError} 当操作进行中或请求失败时抛出错误。
             */
            create: async (data) => {
                const { host } = this;
                const state = host.state;
                // 1. 状态锁保护：防止请求飞行中再次触发
                if (state.loading) {
                    throw new EntityError_1.EntityError('Operation in progress, please wait.', codes_1.KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS);
                }
                // 2. 发起请求 (fetch 内部会自动处理 loading 状态的切换)
                const options = await host.buildOptions('create', {}, data, {});
                const context = await host.fetch('create', options);
                const item = context.data.item;
                await state.updateItem(item);
                host.emit('created', item);
                return state.item;
            },
        };
    }
}
exports.RemoteCreateAbility = RemoteCreateAbility;
//# sourceMappingURL=RemoteCreateAbility.js.map