"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalGetAbility = void 0;
const composable_1 = require("../../../composable");
class LocalGetAbility extends composable_1.AbilityBase {
    expose() {
        const { host } = this;
        const { state } = host;
        return {
            /**
             * 从本地内存中根据 ID 获取实体
             * @param id 实体唯一标识
             */
            get: (id) => {
                const { idField } = host.schema;
                // 1. 在内存源数据中查找
                const result = state.sourceData.find(item => item[idField] === id) || null;
                // 2. 更新状态槽位
                state.item = result; //
                // 3. 发出事件
                host.emit('got', result);
                return result;
            }
        };
    }
}
exports.LocalGetAbility = LocalGetAbility;
//# sourceMappingURL=LocalGetAbility.js.map