import { ILogger, Logger } from '@/logger';
import {
    ICacheProvider,
    IEntity,
    ITreeLifecycleAbility,
    ITreePathAbility,
    ITreeRemoteEntityState,
    ITreeSearchAbility,
    ITreeSearchParams,
    TreeSchema,
} from '../../types';
import { TreeLifecycleAbility, TreeSearchAbility } from './abilities';
import { TreePathAbility } from './abilities/TreePathAbility';
import { RemoteEntityState } from './RemoteEntityState';

export class TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends RemoteEntityState<T, TSearch>
    implements ITreeRemoteEntityState<T, TSearch>
{
    nodes: Map<string | number, T> = new Map();
    hierarchy: Map<string | number | null, (string | number)[]> = new Map();
    lastSearchResultIds: (string | number)[] = [];
    logger: ILogger = null as any;

    constructor(
        schema: TreeSchema,
        cacheProvider?: ICacheProvider,
        cacheTTL: number = 300000
    ) {
        super(schema, cacheProvider, cacheTTL);
        this.logger = Logger.for(`${this.schema.name}.TreeRemoteEntityState`);
        new TreePathAbility<T, TSearch>().attach(this);
        new TreeLifecycleAbility<T, TSearch>().attach(this);
        new TreeSearchAbility<T, TSearch>().attach(this);
    }

    toParams() {
        const base = super.toParams();
        // 如果 parentId 为空，后端可能需要传 0 或者特殊的 ID
        if (!base.parentId) {
            base.parentId = this.root;
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

    isLoaded(id: string | number): boolean {
        const node = this.nodes.get(id) as any;
        if (!node) return false;
        // 如果不是懒加载模式，默认就是已加载
        if (!this.isLazy) return true;
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

    protected getDefaultSearch(): TSearch {
        return {
            parentId: null,
            depth: 1,
            keyword: '',
            sortBy: this.schema.defaultSort || '',
            order: this.schema.defaultOrder || 'asc',
        } as ITreeSearchParams as TSearch;
    }

    private syncDataAndState(data: T | T[]): void {
        this.ingest(data);
        if (this.search.keyword) {
            this.applySearchExpansion();
        }
    }

    dispose(): void {
        this.reset();
        this.lastSearchResultIds = [];
        super.dispose();
    }
}

export interface TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends ITreePathAbility<T>, ITreeLifecycleAbility<T>, ITreeSearchAbility<T> {}
