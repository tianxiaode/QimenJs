import type { AbilityDefinition } from '@/composable';
import type { ILocalChangeSet, IDeletionPlan } from '@/entity/types';
import { CacheFactory } from '@/cache';
import type { ICacheProvider } from '@/cache';
import { array } from '@orbit-js/utils';

/**
 * 简单哈希函数
 */
function _simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

/**
 * FlatLocalStateAbility - 平铺本地状态能力（合并版）
 *
 * 将原 FlatLocalEntityState 的数据字段、StateLocalMutationAbility、
 * StateSearchAbility、StateSchemaAbility、StateCacheAbility、StateDirtyAbility
 * 合并为一个 Ability，直接注入到 Manager 上。
 *
 * this 指向宿主（Manager），数据和方法直接在 this 上访问。
 */

// ---- Schema 属性代理 ----

const schemaGetters: AbilityDefinition = {
    idField: { get() { return this.schema?.idField || 'id'; } },
    idType: { get() { return this.schema?.idType || 'number'; } },
    nameField: { get() { return this.schema?.nameField || 'name'; } },
    defaultSort: { get() { return this.schema?.defaultSort || ''; } },
    defaultOrder: { get() { return this.schema?.defaultOrder || 'asc'; } },
    searchFields: { get() { return this.schema?.searchFields || []; } },
    isTree: { get() { return !!this.schema?.isTree; } },
    isLazy: { get() { return this.schema?.isTree ? !!(this.schema as any).isLazy : false; } },
    root: { get() { return this.schema?.isTree ? (this.schema as any).root : ''; } },
    parentIdField: { get() { return this.schema?.isTree ? (this.schema as any).parentIdField : ''; } },
    childrenField: { get() { return this.schema?.isTree ? (this.schema as any).childrenField : ''; } },
    pathField: { get() { return this.schema?.isTree ? (this.schema as any).pathField : ''; } },
    leafField: { get() { return this.schema?.isTree ? (this.schema as any).leafField : ''; } },
    expandedField: { get() { return this.schema?.isTree ? (this.schema as any).expandedField : ''; } },
    useFlat: { get() { return this.schema?.isTree ? !!(this.schema as any).useFlat : false; } },
};

// ---- 缓存能力 ----

const cacheMethods: AbilityDefinition = {
    cacheKey: {
        get() {
            return this._getCacheKey();
        },
    },

    async tryGetCache() {
        const provider = await this._getCacheProvider();
        return await provider.get(this._getCacheKey());
    },

    async setCache(data: any) {
        const provider = await this._getCacheProvider();
        await provider.set(this._getCacheKey(), data, this.cacheTTL);
    },

    async clearCache() {
        const provider = await this._getCacheProvider();
        await provider.remove(this._getCacheKey());
    },

    updateSourceData(result: any[]) {
        this.sourceData.clear();
        result.forEach((item: any) => {
            this.sourceData.set(item.id, item);
        });
    },

    _getCacheKey(): string {
        const { schema } = this;
        const domain = schema.domain || 'default';
        const base = `${domain}:${schema.name}`;

        if (!this.isRemote) {
            return base;
        }

        const params = this.toParams ? this.toParams() : {};

        if (Object.keys(params).length === 0) {
            return `${base}:root`;
        }

        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return `${base}:q:${_simpleHash(queryStr)}`;
    },

    async _getCacheProvider(): Promise<ICacheProvider> {
        let providerPromise = this.abilityState('StateCache:provider') as Promise<ICacheProvider> | undefined;
        if (!providerPromise) {
            providerPromise = CacheFactory.create((this.schema as any).cache?.type || 'memory').then(provider => {
                this.onCleanup(() => CacheFactory.release(provider.id, true));
                return provider;
            });
            this.setAbilityState('StateCache:provider', providerPromise);
        }
        return providerPromise;
    },
};

// ---- 脏检查能力 ----

const dirtyMethods: AbilityDefinition = {
    isDirty(item?: any): boolean {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        if (!item) return snapshots.size > 0;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        const snapshot: any = snapshots.get(id);
        if (snapshot === undefined) return false;
        return (Object.keys(snapshot) as Array<keyof any>).some(key => {
            if (key === 'updatedAt' || key === 'version') return false;

            const val1 = snapshot[key];
            const val2 = item[key];

            if (typeof val1 !== 'object' || val1 === null) {
                return val1 !== val2;
            }

            return JSON.stringify(val1) !== JSON.stringify(val2);
        });
    },

    startEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        if (!snapshots.has(id)) {
            snapshots.set(id, { ...item });
        }
    },

    submitEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        snapshots.delete(id);
    },

    cancelEdit(item: any) {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        const idField = this.schema.idField || 'id';
        const id = item[idField];
        const snapshot = snapshots.get(id);
        if (snapshot) {
            Object.assign(item, snapshot);
            snapshots.delete(id);
        }
    },

    rollbackAll() {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map<string, any>())!;
        snapshots.clear();
    },
};

// ---- 本地变更集能力 ----

const mutationMethods: AbilityDefinition = {
    hasChanges: {
        get() {
            const changes = this.abilityState('StateLocalMutation:changes') as ILocalChangeSet | undefined;
            return changes !== undefined && (changes.added.length > 0 || changes.updated.size > 0 || changes.deleted.length > 0);
        },
    },

    changes: {
        get() {
            return this.abilityState('StateLocalMutation:changes') ?? this._createEmptyChanges();
        },
    },

    async addItem(item: any) {
        const idField = this.schema.idField || 'id';
        const idType = this.schema.idType || 'string';
        const tempId = idType === 'number' ? -Math.abs(Date.now()) : crypto.randomUUID();
        item.tempId = tempId;
        item.isNew = true;
        const changes = this._getOrCreateChanges();
        changes.added.push(item);
        this.sourceData.set(item[idField] || item.tempId, item);
        await this._commitChange();
    },

    async updateItem(item: any) {
        const idField = this.schema.idField || 'id';
        const key = item[idField] || item.tempId;
        this.sourceData.set(key, { ...item });

        const id = item[idField];
        const changes = this._getOrCreateChanges();
        const isNew = changes.added.some(
            (i: any) => i[idField] === id || i.tempId === item.tempId
        );

        if (!isNew && id) {
            changes.updated.set(id, { ...item });
        }
        await this._commitChange();
    },

    async updateData(result: any[]) {
        const idField = this.schema.idField || 'id';
        this.setAbilityState('StateLocalMutation:changes', this._createEmptyChanges());
        result.forEach((item: any) => {
            const id = item[idField];
            const tempId = item.tempId;
            if (tempId && this.sourceData.has(tempId)) {
                this.sourceData.delete(tempId);
            }
            this.sourceData.set(id, item);
        });
        await this._commitChange();
    },

    async softDelete(plan: IDeletionPlan) {
        const idField = this.schema.idField || 'id';
        const { localOnly, persistent } = plan;

        const localIds = localOnly.map((item: any) => typeof item === 'object' ? item[idField] : item);
        const persistentIds = persistent.map((item: any) => typeof item === 'object' ? item[idField] : item);
        const allIds = [...localIds, ...persistentIds];

        // 保存所有待删除项的快照（用于回滚）
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        allIds.forEach((id: any) => {
            const item = Array.from(this.sourceData.values()).find((i: any) => i[idField] === id);
            if (item) {
                deleteSnapshots.set(id, { ...item });
            }
        });

        if (localIds.length > 0) {
            const changes = this._getOrCreateChanges();
            const localSet = new Set(localIds);
            changes.added = changes.added.filter(
                (item: any) => !localSet.has(item[idField])
            );
            changes.deleted.push(...localIds);
        }

        if (persistentIds.length > 0) {
            const changes = this._getOrCreateChanges();
            changes.deleted.push(...persistentIds);
        }

        await this._deleteFromSource(allIds);
    },

    getDeletionPlan(ids: (string | number)[]): IDeletionPlan {
        const idField = this.schema.idField || 'id';
        const plan: IDeletionPlan = { localOnly: [], persistent: [] };

        const changes = this.abilityState('StateLocalMutation:changes') as ILocalChangeSet | undefined;
        const addedIds = changes ? new Set(changes.added.map((item: any) => item[idField])) : new Set();

        ids.forEach(id => {
            if (addedIds.has(id)) {
                plan.localOnly.push(id);
            } else {
                plan.persistent.push(id);
            }
        });

        return plan;
    },

    async confirmDelete() {
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        deleteSnapshots.clear();
        const changes = this.abilityState('StateLocalMutation:changes') as ILocalChangeSet | undefined;
        if (changes) {
            changes.deleted.length = 0;
        }
        await this._commitChange();
    },

    async rollbackDelete() {
        const deleteSnapshots = this._getOrCreateDeleteSnapshots();
        const changes = this.abilityState('StateLocalMutation:changes') as ILocalChangeSet | undefined;
        if (deleteSnapshots.size === 0 && (!changes || changes.deleted.length === 0)) return;

        deleteSnapshots.forEach((item: any, id: any) => {
            this.sourceData.set(id, item);
        });

        deleteSnapshots.clear();
        if (changes) {
            changes.deleted.length = 0;
        }
        await this._commitChange();
    },

    clearChanges() {
        this.setAbilityState('StateLocalMutation:changes', this._createEmptyChanges());
    },

    // ---- 内部辅助方法 ----

    _getOrCreateChanges(): ILocalChangeSet {
        let changes = this.abilityState('StateLocalMutation:changes') as ILocalChangeSet | undefined;
        if (!changes) {
            changes = this._createEmptyChanges();
            this.setAbilityState('StateLocalMutation:changes', changes);
        }
        return changes!;
    },

    _getOrCreateDeleteSnapshots(): Map<string | number, any> {
        let snapshots = this.abilityState('StateLocalMutation:deleteSnapshots') as Map<string | number, any> | undefined;
        if (!snapshots) {
            snapshots = new Map<string | number, any>();
            this.setAbilityState('StateLocalMutation:deleteSnapshots', snapshots);
        }
        return snapshots;
    },

    _createEmptyChanges(): ILocalChangeSet {
        return {
            added: [],
            updated: new Map(),
            deleted: [],
        };
    },

    async _commitChange() {
        // 缓存立即更新（保证数据一致性）
        await this.setCache?.(this.sourceData);
        // 视图刷新防抖（高频操作时合并渲染）
        this.debounce('refreshView', () => this.refreshView?.(), 50)();
    },

    async _deleteFromSource(ids: (string | number)[]): Promise<void> {
        ids.forEach(key => this.sourceData.delete(key));
        await this._commitChange();
    },
};

// ---- 搜索过滤能力 ----

const searchMethods: AbilityDefinition = {
    toParams(): Record<string, any> {
        const { schema } = this;
        const params: Record<string, any> = {};
        const search = this.search as Record<string, any>;

        Object.keys(search).forEach(key => {
            const value = search[key];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (Array.isArray(value)) {
                params[key] = value.join(',');
                return;
            }

            params[key] = value;
        });

        if (!(schema as any).isTree) {
            params.page = this.page || 1;
            params.pageSize = this.pageSize || 20;
        } else {
            params.parentId = params.parentId || this.root || null;
        }

        return params;
    },

    filter(text: string) {
        (this.search as any).keyword = text;
    },

    searchBy(search: any) {
        this.search = { ...this.search, ...search };
    },

    matchKeyword(item: any): boolean {
        const searchFields = this.schema.searchFields || [];
        const keyword = (this.search as any).keyword;
        if (!keyword) return true;

        const k = keyword.toLowerCase();
        return searchFields.some((field: any) => {
            const value = item[field];
            return typeof value === 'string' && value.toLowerCase().includes(k);
        });
    },

    applySort(list: any[]): any[] {
        const { sortBy, sortOrder } = this.search as any || {};

        if (!sortBy || !list || list.length <= 1) {
            return list;
        }

        return array.orderBy(list, [
            {
                by: sortBy,
                order: (sortOrder || 'asc') as 'asc' | 'desc',
            },
        ]);
    },

    sort(field: string, order: 'asc' | 'desc' = 'asc') {
        (this.search as any).sortBy = field;
        (this.search as any).sortOrder = order;
    },
};

// ---- 合并导出 ----

export const FlatLocalStateAbility: AbilityDefinition = {
    // 数据字段由 Manager 类定义，Ability 不再提供初始值
    // （isRemote, sourceData, loading, items, item, search 均在 Manager 上定义）

    // 计算属性
    isEmpty: { get() { return this.items.length === 0; } },
    total: { get() { return this.items.length; } },
    adds: { get() { return this.changes.added; } },
    updates: { get() { return this.changes.updated; } },

    // refreshView
    async refreshView(): Promise<void> {
        this.loading = true;

        try {
            const allData = Array.from(this.sourceData.values());
            let filtered = allData.filter((item: any) => this.matchKeyword(item));
            this.items = this.applySort(filtered);
        } finally {
            this.loading = false;
        }
    },

    // edit/rollback
    edit(item: any): void {
        this.startEdit(item);
    },

    rollback(): void {
        this.rollbackAll();
    },

    // 合并所有子能力
    ...schemaGetters,
    ...cacheMethods,
    ...dirtyMethods,
    ...mutationMethods,
    ...searchMethods,
};
