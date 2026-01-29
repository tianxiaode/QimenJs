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

    async updateData(data: T | T[]): Promise<void> {
        this.syncDataAndState(data);

        // 树模型下，items 已经是实时 walk 出来的，所以缓存 items 即可
        //await this.setCache(this.items);
    }

    async updateItem(item: T): Promise<void> {
        this.syncDataAndState(item);
        await super.updateItem(item);
    }

    get items(): T[] {
        const result: T[] = [];
        const schema = this.schema as TreeSchema;
        const expandedField = schema.expandedField || 'expanded';
        const idField = this.idField;

        /**
         * @param pid 当前处理的父 ID
         * @param depth 当前深度，用于 UI 缩进控制
         */
        const walk = (pid: string | number | null, depth: number) => {
            // 1. 从索引表中取出当前层级的所有子 ID
            const childIds = this.hierarchy.get(pid) || [];

            // 2. 获取实体并进行排序（利用你已有的 applySort）
            const children = childIds.map(id => this.nodes.get(id)!).filter(Boolean);
            const sortedChildren = this.applySort(children);

            // 3. 遍历并递归
            sortedChildren.forEach(node => {
                // 注入深度信息，方便组件渲染缩进
                // 💡 这里我们不需要修改原始 node，而是解构出一个新对象
                result.push({ ...node, _depth: depth });

                // 4. 只有当父节点被展开时，才继续往下走
                if ((node as any)[expandedField]) {
                    walk(node[idField], depth + 1);
                }
            });
        };

        // 从 Schema 定义的根节点开始走
        walk(schema.root || null, 0);
        return result;
    }

    get treeData(): T[] {
        const schema = this.schema as TreeSchema;
        const childrenField = schema.childrenField || 'children';
        const idField = this.idField;

        const build = (pid: string | number | null): T[] => {
            const childIds = this.hierarchy.get(pid) || [];
            const children = childIds.map(id => this.nodes.get(id)!).filter(Boolean);
            const sorted = this.applySort(children);

            return sorted.map(node => ({
                ...node,
                [childrenField]: build(node[idField]), // 递归构建嵌套结构
            }));
        };

        return build(schema.root || null);
    }

    removeNode(id: string | number): void {
        const targetNode = this.nodes.get(id) as any;
        if (!targetNode) return;

        const pathPrefix = targetNode._path; // 例如 "1.2"
        const pid = targetNode.parentId;

        // 1. 从父级的索引中移除自己 (只影响直接父级)
        const siblings = this.hierarchy.get(pid);
        if (siblings) {
            this.hierarchy.set(
                pid,
                siblings.filter(childId => childId !== id)
            );
        }

        // 2. 批量删除自己和所有子孙 (线性扫描)
        // 凡是路径为 "1.2" 或以 "1.2." 开头的节点全部删除
        this.nodes.forEach((node: any, nodeId) => {
            if (nodeId === id || node._path.startsWith(`${pathPrefix}.`)) {
                this.nodes.delete(nodeId);
                this.hierarchy.delete(nodeId); // 同时清理这些节点的子索引
            }
        });
    }

    moveNode(id: string | number, targetPid: string | number | null): void {
        const node = this.nodes.get(id) as any;
        if (!node) return;

        const oldPid = node.parentId;
        if (oldPid === targetPid) return;

        // 1. 获取旧路径和新父节点的路径
        const oldPathPrefix = node._path; // 例如 "1.2"
        const targetParent = this.nodes.get(targetPid as any) as any;
        const newParentPath = targetParent?._path || '';
        const newPathPrefix = newParentPath ? `${newParentPath}.${id}` : `${id}`;

        // 2. 修正 hierarchy 索引 (维护兄弟关系)
        // 从旧父级移除
        const oldSiblings = this.hierarchy.get(oldPid);
        if (oldSiblings) {
            this.hierarchy.set(
                oldPid,
                oldSiblings.filter(sid => sid !== id)
            );
        }
        // 加入新父级
        const newSiblings = this.hierarchy.get(targetPid) || [];
        if (!newSiblings.includes(id)) {
            newSiblings.push(id);
            this.hierarchy.set(targetPid, newSiblings);
        }

        // 3. 批量更新自己及所有子孙节点的路径和深度 (关键：利用 path 进行前缀替换)
        this.nodes.forEach((item: any) => {
            // 如果是该节点本身，或者是该节点的子孙
            if (item.id === id || item._path.startsWith(`${oldPathPrefix}.`)) {
                // 字符串替换：把旧前缀换成新前缀
                // 例如把 "1.2.3" 换成 "4.5.2.3"
                item._path = item._path.replace(oldPathPrefix, newPathPrefix);

                // 重新计算深度
                item._depth = item._path.split('.').length - 1;

                // 如果是移动节点本人，还要更新 parentId
                if (item.id === id) {
                    item.parentId = targetPid;
                }
            }
        });

        // 4. (可选) 如果移动到了一个未展开的节点下，可能需要自动展开目标父节点
        if (targetParent) {
            const expandedField = (this.schema as any).expandedField || 'expanded';
            targetParent[expandedField] = true;
        }
    }

    toggleExpand(id: string | number, expanded?: boolean): void {
        const node = this.nodes.get(id) as any;
        const expandedField = (this.schema as TreeSchema).expandedField || 'expanded';

        if (node) {
            // 如果传了值就设为传的值，没传就取反
            node[expandedField] = expanded ?? !node[expandedField];
        }
    }

    isLoaded(id: string | number): boolean {
        const node = this.nodes.get(id) as any;
        if (!node) return false;
        // 如果不是懒加载模式，默认就是已加载
        if (!(this.schema as TreeSchema).isLazy) return true;
        return !!node._loaded;
    }

    setLoaded(id: string | number, loaded: boolean = true): void {
        const node = this.nodes.get(id) as any;
        if (node) {
            node._loaded = loaded;
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

    protected ingest(data: T | T[], manualParentId?: string | number | null): void {
        const list = Array.isArray(data) ? data : [data];
        const {
            parentIdField = 'parentId',
            root = null,
            leafField = 'leaf',
        } = this.schema as TreeSchema;

        // 本次变动的“顶层”节点，即路径计算的起点
        const seeds = new Set<any>();

        // 1. 第一遍：入库、建立索引、初步识别种子
        list.forEach((node: any) => {
            const id = node.id;
            const pid = node[parentIdField] ?? manualParentId ?? root;
            node[parentIdField] = pid;
            this.nodes.set(id, node);

            // 维护父子索引
            const siblings = this.hierarchy.get(pid) || [];
            if (!siblings.includes(id)) {
                siblings.push(id);
                this.hierarchy.set(pid, siblings);
            }

            // 判定种子：如果 pid 是 root，或者是我们手动指定的父，它就是计算起点
            if (pid === root || pid === manualParentId) {
                seeds.add(node);
            }
        });

        // 2. 第二遍：定向扩散
        if (manualParentId && this.nodes.has(manualParentId)) {
            // 场景 2：直接从指定的父节点向下刷，这是最快的，因为它甚至不需要遍历 seeds
            const pNode = this.nodes.get(manualParentId) as any;
            this.rebuildDescendantsPaths(manualParentId, pNode._path || '');
        } else if (seeds.size > 0) {
            // 场景 1 & 3：从识别出的种子开始向下刷
            seeds.forEach(seed => {
                // 如果种子本身就是第一层，先给它初始化路径
                const pNode = this.nodes.get(seed[parentIdField]) as any;
                const pPath = pNode?._path || '';

                // 更新种子本身的路径
                seed._path = pPath ? `${pPath}.${seed.id}` : `${seed.id}`;
                seed._depth = seed._path.split('.').length - 1;

                // 递归更新它的后代
                this.rebuildDescendantsPaths(seed.id, seed._path);
            });
        }

        // 3. 动态维护父节点和子节点的 leaf 状态
        list.forEach((node: any) => {
            const pid = node[parentIdField];
            // 如果我有父节点，那么我的父节点一定不是 leaf
            if (pid && pid !== root) {
                const parent = this.nodes.get(pid) as any;
                if (parent) parent[leafField] = false;
            }

            // 初始化自己的 leaf 状态（如果 hierarchy 里没查到子，暂定为 true）
            const myChildren = this.hierarchy.get(node.id);
            node[leafField] = !(myChildren && myChildren.length > 0);
        });
    }

    private rebuildDescendantsPaths(pid: any, parentPath: string): void {
        const childIds = this.hierarchy.get(pid) || [];
        childIds.forEach(id => {
            const node = this.nodes.get(id) as any;
            if (node) {
                node._path = parentPath ? `${parentPath}.${id}` : `${id}`;
                node._depth = parentPath ? parentPath.split('.').length : 0;
                // 情况 1 & 3 可能带有多层，所以这里必须保持递归
                this.rebuildDescendantsPaths(id, node._path);
            }
        });
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

    private syncDataAndState(data: T | T[]): void {
        this.ingest(data);
        if (this.search.keyword) {
            this.applySearchExpansion();
        }
    }

    private applySearchExpansion(): void {
        const schema = this.schema as TreeSchema;
        const expandedField = schema.expandedField || 'expanded';
        const pidField = schema.parentIdField || 'parentId';
        const keyword = this.search.keyword!.toLowerCase();

        // 关键：必须按深度降序（从深到浅）
        const sortedNodes = Array.from(this.nodes.values()).sort(
            (a: any, b: any) => (b._depth || 0) - (a._depth || 0)
        );

        const parentIdsToExpand = new Set<string | number>();

        sortedNodes.forEach((node: any) => {
            const id = node.id;
            const pid = node[pidField];

            // 如果我命中了，或者我的孩子命中了（即我在 Set 里）
            if (this.matchKeyword(node, keyword) || parentIdsToExpand.has(id)) {
                node[expandedField] = true;

                // 向上层传导：把父 ID 加入 Set
                if (pid && pid !== schema.root) {
                    parentIdsToExpand.add(pid);
                }
            }
        });
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
