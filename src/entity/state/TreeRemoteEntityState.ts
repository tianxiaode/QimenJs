import { ILogger, Logger } from '@orbitjs/logger';
import {
    ICacheProvider,
    IEntity,
    ITreeLifecycleAbility,
    ITreePathAbility,
    ITreeRemoteEntityState,
    ITreeSearchAbility,
    ITreeSearchParams,
    ITreeViewAbility,
    TreeSchema,
} from '../../types';
import { TreeLifecycleAbility, TreeSearchAbility, TreePathAbility } from './abilities';
import { RemoteEntityState } from './RemoteEntityState';
import { TreeViewAbility } from './abilities/TreeViewAbility';

export class TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends RemoteEntityState<T, TSearch>
    implements ITreeRemoteEntityState<T, TSearch>
{
    nodes: Map<string | number, T> = new Map();
    hierarchy: Map<string | number | null, (string | number)[]> = new Map();
    logger: ILogger = null as any;
    items: T[] = [];

    constructor(schema: TreeSchema, cacheProvider?: ICacheProvider, cacheTTL: number = 300000) {
        super(schema, cacheProvider, cacheTTL);
        this.logger = Logger.for(`${this.schema.name}.TreeRemoteEntityState`);
        new TreePathAbility<T, TSearch>().attach(this);
        new TreeLifecycleAbility<T, TSearch>().attach(this);
        new TreeSearchAbility<T, TSearch>().attach(this);
        new TreeViewAbility<T, TSearch>().attach(this);
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
        this.refreshView();
    }

    async delete(id: string | number | (string | number)[]):Promise<void> {
        const ids = Array.isArray(id)? id : [id];
        ids.forEach(id => {
            this.removeNode(id);
        });
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
        super.dispose();
    }
}

export interface TreeRemoteEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends
        ITreePathAbility<T>,
        ITreeLifecycleAbility<T>,
        ITreeSearchAbility<T>,
        ITreeViewAbility<T> {}
