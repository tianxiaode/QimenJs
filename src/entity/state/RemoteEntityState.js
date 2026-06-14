"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteEntityState = void 0;
const BaseEntityState_1 = require("./BaseEntityState");
class RemoteEntityState extends BaseEntityState_1.BaseEntityState {
    constructor() {
        super(...arguments);
        this.snapshot = null;
    }
    isDirty(currentItem) {
        if (!this.snapshot || !currentItem)
            return false;
        const keys = Object.keys(this.snapshot);
        return keys.some(key => {
            if (key === 'updatedAt' || key === 'version')
                return false;
            const val1 = this.snapshot[key];
            const val2 = currentItem[key];
            // 基础类型直接比对
            if (typeof val1 !== 'object' || val1 === null) {
                return val1 !== val2;
            }
            // 对象/数组使用简单的 JSON 比对（或者引入 lodash.isEqual）
            return JSON.stringify(val1) !== JSON.stringify(val2);
        });
    }
    edit(item) {
        this.snapshot = { ...item };
    }
    rollback() {
        return this.snapshot ? { ...this.snapshot } : null;
    }
    dispose() {
        this.snapshot = null;
        super.dispose();
    }
}
exports.RemoteEntityState = RemoteEntityState;
//# sourceMappingURL=RemoteEntityState.js.map