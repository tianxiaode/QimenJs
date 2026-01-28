import { IEntity, ITreeRemoteEntityState, ITreeSearchParams, TreeSchema } from '../../types';
import { RemoteEntityState } from './RemoteEntityState';
import { array } from '@orbitjs/utils';

export class TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends RemoteEntityState<T, TSearch>
    implements ITreeRemoteEntityState<T, TSearch>
{
    nodes: Map<string | number, T> = new Map();
    hierarchy: Map<string | number | null, (string | number)[]> = new Map();
    lastSearchResultIds: (string | number)[] = [];

    toParams() {
        const base = super.toParams();
        // 如果 parentId 为空，后端可能需要传 0 或者特殊的 ID
        if (!base.parentId) {
            base.parentId = (this.schema as TreeSchema).root || 'ROOT';
        }
        return base;
    }

    async updateData(data: T | T[], manualParentId?: string | number | null): Promise<void> {
        // 1. 直接塞入，利用 ingest 的递归和去重能力
        this.ingest(data, manualParentId);

        // 2. 如果是搜索，我们不需要清除 Map，
        // 但我们可以记录一下“最后一次搜索结果的 ID 列表”，
        // 方便 UI 快速定位哪些节点是命中的。
        if (this.search.keyword) {
            this.lastSearchResultIds = Array.isArray(data)
                ? data.map(n => (n as any).id)
                : [(data as any).id];
        }
        //await this.setCache(this.items);
    }

    get items(): T[] {
        const targetId = this.search.parentId || (this.schema as TreeSchema).root || null;
        const childIds = this.hierarchy.get(targetId) || [];

        const list = childIds.map(id => this.nodes.get(id)!).filter(Boolean);

        // 使用你的 orderBy 工具函数
        // 这里的排序条件可以从 search 对象中动态获取
        return this.applySort(list);
    }

    get treeData(): T[] {
        const build = (pid: string | number | null = null): T[] => {
            const ids = this.hierarchy.get(pid) || [];
            const unsorted = ids.map(id => this.nodes.get(id)!).filter(Boolean);

            // 每一层级内部排序
            const sorted = this.applySort(unsorted);

            return sorted.map(node => ({
                ...node,
                // 递归挂载子节点
                children: build((node as any).id),
            }));
        };
        return build(null);
    }

    updateNodes(parentId: string | number | null, children: T[]): void {
        this.ingest(children, parentId);
    }

    async updateItem(item: T): Promise<void> {
        const idField = this.idField;
        const id = (item as any)[idField];
        if (id) {
            this.ingest(item);
        }
        await super.updateItem(item);
    }

    removeNode(id: string | number): void {
        const node = this.nodes.get(id);
        if (!node) return;

        // 1. 从父节点的 hierarchy 索引中移除
        const pid = (node as any).parentId ?? (this.schema as TreeSchema).root ?? null;
        const siblings = this.hierarchy.get(pid);
        if (siblings) {
            this.hierarchy.set(
                pid,
                siblings.filter(childId => childId !== id)
            );
        }

        // 2. 递归删除所有子节点（防止内存泄漏）
        const childrenIds = this.hierarchy.get(id) || [];
        childrenIds.forEach(childId => this.removeNode(childId));

        // 3. 从 nodes 仓库和索引表中彻底移除
        this.nodes.delete(id);
        this.hierarchy.delete(id);
    }

    moveNode(id: string | number, newParentId: string | number | null): void {
        const node = this.nodes.get(id);
        if (!node) return;

        const oldPid = (node as any).parentId ?? (this.schema as TreeSchema).root ?? null;
        const targetPid = newParentId ?? (this.schema as TreeSchema).root ?? null;

        if (oldPid === targetPid) return; // 位置没变

        // 1. 从旧父节点的索引中移除
        const oldSiblings = this.hierarchy.get(oldPid);
        if (oldSiblings) {
            this.hierarchy.set(
                oldPid,
                oldSiblings.filter(sid => sid !== id)
            );
        }

        // 2. 更新节点自身的 parentId
        (node as any).parentId = newParentId;

        // 3. 加入新父节点的索引
        const newSiblings = this.hierarchy.get(targetPid) || [];
        if (!newSiblings.includes(id)) {
            newSiblings.push(id);
            this.hierarchy.set(targetPid, newSiblings);
        }
    }

    updateNode(id: string | number, patch: Partial<T>): void {
        const node = this.nodes.get(id);
        if (node) {
            // 合并数据
            const updatedNode = { ...node, ...patch };
            this.nodes.set(id, updatedNode);
        }
    }

    toggleExpand(id: string | number, expanded?: boolean): void {
        const node = this.nodes.get(id);
        if (node) {
            const field = (this.schema as TreeSchema).expandedField || 'expanded';
            const nextState = expanded ?? !(node as any)[field];

            // 更新节点状态
            this.updateNode(id, { [field]: nextState } as any);

            // 如果是懒加载且展开，可能需要触发加载子节点
            if (nextState && (this.schema as TreeSchema).isLazy) {
                // 这里可以由 Ability 监听或显式调用 loadDetail
            }
        }
    }

    getCacheKey(): string {
        const params: any = this.toParams();
        // 将所有参数按 key 排序后序列化，确保缓存键的唯一性和稳定性
        const queryStr = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${this.schema.name}:${queryStr}`;
    }

    reset(): void {
        this.lastSearchResultIds = [];
        this.item = null;
        this.loading = false;
        this.snapshot = null;
        this.nodes.clear();
        this.hierarchy.clear();
        this.search = this.getDefaultSearch();
    }

    private ingest(data: T | T[], manualParentId?: string | number | null): void {
        const list = Array.isArray(data) ? data : [data];
        const schema = this.schema as TreeSchema;
        const expandedField = schema.expandedField || 'expanded';
        const leafField = schema.leafField || 'leaf';
        const parentIdField = schema.parentIdField || 'parentId';
        const childrenField = schema.childrenField || 'children';

        list.forEach((node: any) => {
            const id = node.id;
            // 自动判定父 ID：优先取节点自带的，其次取手动传入的，最后取根节点
            const pid = node[parentIdField] ?? manualParentId ?? schema.root ?? null;
            node[parentIdField] = pid;

            if (node[expandedField] === undefined) {
                node[expandedField] = false;
            }

            if (node[leafField] === undefined) {
                const children = node[childrenField];
                if (children && Array.isArray(children) && children.length > 0) {
                    node[leafField] = false; // 有子节点，显然不是叶子
                } else if (!schema.isLazy) {
                    // 如果不是懒加载模式，且没有子节点，则判定为叶子
                    node[leafField] = true;
                } else {
                    // 如果是懒加载模式，默认先设为 false，允许用户点击触发加载
                    node[leafField] = false;
                }
            }

            // 1. 节点进入仓库（Map 自动处理了“去重”和“更新”）
            this.nodes.set(id, node);

            // 2. 更新索引表：将 ID 关联到父节点的子列表中
            const siblings = this.hierarchy.get(pid) || [];
            if (!siblings.includes(id)) {
                siblings.push(id);
                this.hierarchy.set(pid, siblings);
            }

            // 3. 递归：如果后端在搜索时直接返回了嵌套的 children
            const children = node[childrenField];
            if (children && Array.isArray(children)) {
                this.ingest(children, id);
            }
        });
    }

    get expandedKeys(): (string | number)[] {
        if (!this.search.keyword) return [];

        // 逻辑：所有搜索命中的节点的父 ID 路径都应该被展开
        const keys = new Set<string | number>();
        this.nodes.forEach(node => {
            if (this.matchKeyword(node, this.search.keyword!)) {
                // 往上找所有祖先并加入 keys (需要节点自带 parentId)
                this.fillAncestorKeys(node, keys);
            }
        });
        return Array.from(keys);
    }

    protected getDefaultSearch(): TSearch {
        return {
            parentId: null,
            depth: 1,
            keyword: '',
            sortBy: this.schema.defaultSort || '',
            order: this.schema.defaultOrder || 'asc',
        } as ITreeSearchParams as TSearch;
    }

    private matchKeyword(node: T, keyword: string): boolean {
        if (!keyword) return false;
        // 假设实体上有 name 或 label 字段，你可以根据 schema 配置灵活调整
        const label = (node as any).name || (node as any).label || (node as any).title || '';
        return label.toLowerCase().includes(keyword.toLowerCase());
    }

    private fillAncestorKeys(node: T, keys: Set<string | number>): void {
        let currentPid = (node as any).parentId;
        const rootId = (this.schema as TreeSchema).root || null;

        // 只要没到根节点，就一直向上追溯
        while (currentPid && currentPid !== rootId) {
            if (keys.has(currentPid)) break; // 防止死循环或重复计算
            keys.add(currentPid);

            const parentNode = this.nodes.get(currentPid);
            if (parentNode) {
                currentPid = (parentNode as any).parentId;
            } else {
                break; // 如果父节点没在缓存里，终止
            }
        }
    }

    private applySort(list: T[]): T[] {
        if (!this.search.sortBy || list.length <= 1) return list;

        return array.orderBy(list, [
            {
                by: this.search.sortBy as keyof T,
                order: this.search.order as 'asc' | 'desc',
            },
        ]);
    }

    dispose(): void {
        this.reset();
        this.lastSearchResultIds = [];
        super.dispose();
    }
}
