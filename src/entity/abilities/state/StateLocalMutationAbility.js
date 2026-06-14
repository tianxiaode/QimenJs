"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateLocalMutationAbility = void 0;
const composable_1 = require("../../composable");
class StateLocalMutationAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        // 内部维护变更集
        this._changes = this.createEmptyChanges();
        this._deleteSnapshots = new Map();
    }
    expose() {
        const host = this.host;
        const idField = host.idField;
        return {
            hasChanges: { get: () => this._changes.added.length > 0 || this._changes.updated.size > 0 },
            // 暴露变更集只读引用
            changes: { get: () => this._changes },
            /**
             * 新增项
             */
            addItem: async (item) => {
                const idType = host.idType || 'string';
                const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
                item.tempId = tempId; // 标记临时id，用于后续删除
                item.isNew = true; // 标记为新增
                this._changes.added.push(item);
                host.sourceData.set(this.getMapKey(item), item);
                await this.commitChange();
            },
            /**
             * 更新项
             */
            updateItem: async (item) => {
                const key = this.getMapKey(item);
                // 1. 更新 sourceData (Map 直接覆盖)
                host.sourceData.set(key, { ...item });
                // 2. 记录到变更集
                const id = item[idField];
                const isNew = this._changes.added.some((i) => i[idField] === id || i.tempId === item.tempId);
                if (!isNew && id) {
                    this._changes.updated.set(id, { ...item });
                }
                await this.commitChange();
            },
            updateData: async (result) => {
                this._changes = this.createEmptyChanges();
                result.forEach((item) => {
                    const id = item[idField];
                    const tempId = item.tempId;
                    const exists = host.sourceData.has(id) || (tempId && host.sourceData.has(tempId));
                    if (tempId && host.sourceData.has(tempId)) {
                        // 关键：如果是从临时项转正，删除旧的 tempId Key
                        host.sourceData.delete(tempId);
                    }
                    host.sourceData.set(id, item);
                });
                await this.commitChange();
            },
            /**
             * 软删除：先从视觉和源数据中移除，存入快照
             */
            softDelete: async (plan) => {
                const { localOnly, persistent } = plan;
                // 1. 处理新增项：直接彻底删除（因为没有远程开销，失败概率极低）
                if (localOnly.length > 0) {
                    const localSet = new Set(localOnly);
                    this._changes.added = this._changes.added.filter(item => !localSet.has(item[idField]));
                }
                // 2. 处理持久化项：记录快照并暂时移除
                persistent.forEach(id => {
                    const item = host.sourceData.find((i) => i[idField] === id);
                    if (item) {
                        this._deleteSnapshots.set(id, { ...item }); // 存入回收站
                        // 如果有待更新的补丁，也顺便存一份
                        if (this._changes.updated.has(id)) {
                            // 可选：记录 updated 状态
                        }
                    }
                });
                // 3. 从内存和视图中移除
                await this.delete([...localOnly, ...persistent]);
            },
            getDeletionPlan: (ids) => {
                const idField = host.idField;
                const plan = { localOnly: [], persistent: [] };
                // 获取当前新增缓冲区的 ID 集合
                const addedIds = new Set(this._changes.added.map(item => item[idField]));
                ids.forEach(id => {
                    if (addedIds.has(id)) {
                        plan.localOnly.push(id);
                    }
                    else {
                        plan.persistent.push(id);
                    }
                });
                return plan;
            },
            confirmDelete: async () => {
                this._deleteSnapshots.clear();
                await this.commitChange();
            },
            rollbackDelete: async () => {
                if (this._deleteSnapshots.size === 0)
                    return;
                this._deleteSnapshots.forEach((item, id) => {
                    host.sourceData.set(id, item);
                    // 如果原本就在 updated 列表里，这里还可以根据需求恢复状态
                });
                this._deleteSnapshots.clear();
                await this.commitChange();
            },
            /**
             * 重置所有变更
             */
            clearChanges: () => {
                this._changes = this.createEmptyChanges();
            },
        };
    }
    async commitChange() {
        var _a, _b;
        const host = this.host;
        // 1. 触发视图刷新
        (_a = host.refreshView) === null || _a === void 0 ? void 0 : _a.call(host);
        // 2. 自动同步到缓存
        await ((_b = host.setCache) === null || _b === void 0 ? void 0 : _b.call(host, host.sourceData));
    }
    getMapKey(item) {
        const host = this.host;
        // 优先取正式 ID，没有则取 tempId，再没有取随机生成的唯一标识
        return item[host.idField] || item.tempId;
    }
    createEmptyChanges() {
        return {
            added: [],
            updated: new Map(),
        };
    }
    async delete(id) {
        const host = this.host;
        const ids = Array.isArray(id) ? id : [id];
        // Map 的删除极其简单高效
        ids.forEach(key => host.sourceData.delete(key));
        await this.commitChange();
    }
    onDispose() {
        this._changes.added = null;
        this._changes.updated.clear();
        this._changes = null;
        this._deleteSnapshots.clear();
        this._deleteSnapshots = null;
    }
}
exports.StateLocalMutationAbility = StateLocalMutationAbility;
//# sourceMappingURL=StateLocalMutationAbility.js.map