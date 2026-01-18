import { ENTITY_ACTION } from '../base';
import { EntityRequestTask, FlowContext } from '../actions';
import { RequestOptions } from '../http';
import { IComposableBase } from '../composable';

export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
    emit(event: string, data: any): void;
    [key: string]: any;
}


export interface ICollectionState<T = any, TSearch = Record<string, any>> {
    items: T[];
    item: T  | null;
    total: number;
    pageIndex: number;
    pageSize: number;
    pageSizes: number[];
    pageCount: number;
    filter: string;
    search: TSearch;
    loading: boolean;
    cacheTTL: number;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    toParams(): Record<string, any>;
    updateList(items: T[], total: number): void;
    getSource(): T[];
    setSource(source: T[]): void;
    tryGetCache(): { items: T[]; total: number } | null;
    updateView(items: T[], total?: number): void;
    setCache(items: T[], total: number): void;
    reset(includePageSettings: boolean): void;
    setSort(key: string, order: 'asc' | 'desc' | null): void;
    dispose(): void;
}

export interface IEntityManagerBase<T = any, TC = Record<string, any>> extends ICoreEntityManager {
    state: ICollectionState<T, TC>;
    fetch(
        action: ENTITY_ACTION | string,
        payload: any,
        updater?: (data: any) => void
    ): Promise<FlowContext>;
}

export interface ITreeCollectionState<T> {
  // 1. 核心数据：所有节点打平存储，实现 O(1) 查找
  nodes: Record<string, T>; 

  // 2. 关系索引：parentId -> childrenIds[]
  // 哪怕后端返回的是嵌套结构，也要打平成这个索引，方便 UI 渲染和局部更新
  hierarchy: Record<string, string[]>; 

  // 3. UI 交互状态
  expandedKeys: Set<string>;   // 展开的节点
  loadingKeys: Set<string>;    // 正在加载子节点的节点 (Lazy 模式专用)
  loadedKeys: Set<string>;     // 已经加载过子节点的节点 (避免 Lazy 模式重复请求)
  selectedKey?: string;        // 当前选中的节点
  
  // 4. 根节点引用
  rootIds: string[];
}