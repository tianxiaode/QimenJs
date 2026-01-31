import { BaseEntityState } from './BaseEntityState';
import {
    IDeletionPlan,
    IEntity,
    ILocalChangeSet,
    ILocalEntityState,
    SearchParams,
} from '../../types';

export abstract class LocalEntityState<T extends IEntity, TSearch extends SearchParams>
    extends BaseEntityState<T, TSearch>
    implements ILocalEntityState<T, TSearch>
{
    sourceData: T[] = [];
    changes: ILocalChangeSet<T> = this.createEmptyChanges();

    getCacheKey(): string {
        // 本地模式的 Key 通常只跟 Schema 名称有关，因为它是全量缓存
        return `local_cache:${this.schema.name}`;
    }

    get hasChanges(): boolean {
        return this.changes.added.length > 0 || this.changes.updated.size > 0;
    }

    add(item: T): void {
        const idType = this.schema.idType || 'string';
        let tempId: string | number;

        if (idType === 'number') {
            // 使用负数作为临时 ID，避免与后端自增正数冲突
            // 可以取当前已有的最小负数再减 1，或者使用 Date.now() 的负值
            tempId = -Math.abs(Date.now());
        } else {
            // 使用标准的 UUID 字符串
            tempId = crypto.randomUUID();
        }

        const payload = {
            ...item,
            tempId,
            isNew: true,
        };
    }

    get addedItems(): T[] {
        return this.changes.added;
    }

    get updatedItems(): T[] {
        // 将 Map 的 Value 转为数组，方便 Spring / EF Core 接收
        return Array.from(this.changes.updated.values());
    }

    get pendingItems(): T[] {
        return [...this.addedItems, ...this.updatedItems];
    }

    getDeletionPlan(ids: (string | number)[]): IDeletionPlan {
        const plan: IDeletionPlan = { localOnly: [], persistent: [] };

        // 获取当前新增缓冲区的 ID 集合
        const addedIds = new Set(this.changes.added.map(item => (item as any)[this.idField]));

        ids.forEach(id => {
            if (addedIds.has(id)) {
                plan.localOnly.push(id);
            } else {
                plan.persistent.push(id);
            }
        });

        return plan;
    }

    update(item: T): void {
        const idField = this.idField;
        const id = item[idField as keyof T];

        // 1. 优先检查并更新“新增项”缓冲区
        const addedIndex = this.changes.added.findIndex(i => (i as any)[idField] === id);
        if (addedIndex > -1) {
            // 直接替换新增数组里的对象
            this.changes.added[addedIndex] = { ...this.changes.added[addedIndex], ...item };
            return;
        }

        // 2. 检查并更新“持久化项”补丁
        const oldItem = this.sourceData.find(i => i[idField as keyof T] === id);
        if (oldItem) {
            const newItem = { ...oldItem, ...item };
            this.changes.updated.set(id, newItem);
        }
    }

    abstract delete(id: string | number | (string | number)[]): Promise<void>;

    confirmDelete(plan: IDeletionPlan): void {
        const idField = this.idField;

        // 1. 清理“新增”缓冲区 (Added)
        if (plan.localOnly.length > 0) {
            const localSet = new Set(plan.localOnly);
            this.changes.added = this.changes.added.filter(
                item => !localSet.has((item as any)[idField])
            );
        }

        // 2. 清理“待更新”缓冲区 (Updated) 并从源数据中删除
        if (plan.persistent.length > 0) {
            // 移除该 ID 对应的所有待提交更新补丁
            plan.persistent.forEach(id => this.changes.updated.delete(id));

            // 执行物理移除（从 sourceData 中滤除）
            this.delete(plan.persistent);
        }
    }

    reset(): void {
        this.changes = this.createEmptyChanges();
    }

    matchKeyword(item: T, keyword: string): boolean {
        if (!keyword) return true;
        const lowerKeyword = keyword.toLowerCase();

        // 优先使用你在 Schema 处理阶段提取好的 searchableFields
        const fields = this.schema.searchFields || ['name', 'title', 'code'];

        return fields.some(field => {
            const value = (item as any)[field];
            // 增加对数字等非字符串类型的兼容
            return (
                value !== null &&
                value !== undefined &&
                String(value).toLowerCase().includes(lowerKeyword)
            );
        });
    }

    protected createEmptyChanges(): ILocalChangeSet<T> {
        return {
            added: [],
            updated: new Map(),
        };
    }

    async updateItem(item: T): Promise<void> {
        const idField = this.idField;
        const cid = (item as any).tempId;
        const serverId = (item as any)[idField];

        // 1. 同步权威源数据
        const index = this.sourceData.findIndex(i => {
            // 优先匹配 tempId，其次匹配 serverId
            if (cid) return (i as any).tempId === cid;
            return (i as any)[idField] === serverId;
        });

        if (index > -1) {
            this.sourceData[index] = { ...this.sourceData[index], ...item };
        } else {
            this.sourceData.push(item);
        }

        // 2. 【核心修复】精准清理缓冲区
        if (cid) {
            // 如果有 tempId，说明是新增回执，从 added 中移除
            this.changes.added = this.changes.added.filter(i => (i as any).tempId !== cid);
        }
        if (serverId) {
            // 既然服务器已经返回了最新状态，本地的“待提交”标记就没意义了，直接删除
            this.changes.updated.delete(serverId);
        }

        // 3. 更新详情
        await super.updateItem(item);

        // 4. 同步持久化缓存
        await this.setCache(this.sourceData);
    }

    dispose(): void {
        this.sourceData = [];
        this.changes = this.createEmptyChanges();
        super.dispose();
    }
}
