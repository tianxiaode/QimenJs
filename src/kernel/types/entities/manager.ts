import { ENTITY_ACTION } from './base';
import { EntityRequestTask, FlowContext } from '../actions';
import { RequestOptions } from '../http';
import { IComposableBase } from '../composable';
import { IEntity, IFlatSearchParams, ILocalSearchParams, ITreeSearchParams, SearchParams } from './schema';


export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
    emit(event: string, data: any): void;
    [key: string]: any;
}

export interface IBaseState<T = IEntity, TSearch = SearchParams> {
    loading: boolean;
    item: T | null;
    search: TSearch; // 统一搜索对象
    cacheTTL: number;

    /** * 获取当前搜索条件对应的缓存 Key
     * Flat 模式下可能是 page+pageSize+keyword
     * Tree 模式下可能是 parentId+keyword
     */
    getCacheKey(): string;

    /** 尝试从 Provider 中获取当前 search 对应的缓存 */
    tryGetCache(): any;

    /** 将数据存入 Provider */
    setCache(data: any): void;

    /** 清除所有缓存 */
    clearCache(): void;

    // 基础操作
    toParams(): Record<string, any>;
    reset(): void;
    dispose(): void;
}

export interface IFlatRemoteState<T = IEntity> extends IBaseState<T, IFlatSearchParams> {
    items: T[]; 
    total: number;
    pages: number;
    pageSizes: number[];
    
    // 修改IFlatSearchParams的pageSize参数，需要检查是否在pageSizes范围内
    changeSize(size: number): void;
    //修改IFlatSearchParams的page参数，需要防止超出范围
    jumpTo(page: number): void;
    //调用jumpTo接口，需要防止超出范围
    prev():void;
    //调用jumpTo接口，需要防止超出范围
    next():void;
    //修改IFlatSearchParams的排序参数
    sort(field: string, order: 'asc' | 'desc'):void;
    //修改IFlatSearchParams的过滤参数
    filter(keyword: string):void;
    //重置IFlatSearchParams的查询参数
    search(params: Omit<IFlatSearchParams, 'page' | 'pageSize'>):void;    
    updateData(items: T[], total: number): void;
    //刷新当前页
    refresh(force?: boolean):Promise<T[]>;
}

export interface IFlatLocalState<T = IEntity> extends IBaseState<T, ILocalSearchParams> {
    rawItems: T[];   // 完整的数据源
    filteredItems: T[]; // 经过 keyword 过滤后的数据
}

export interface ITreeRemoteState<T = IEntity> extends IBaseState<T, ITreeSearchParams> {
    nodes: Map<string | number, T>;
    hierarchy: Map<string | number | null, (string | number)[]>;
    // 核心：把后端返回的一段子项挂载到 parentId 下
    updateNodes(parentId: string | number | null, children: T[]): void;
}

export interface ITreeLocalState<T = IEntity> extends IBaseState<T, ILocalSearchParams> {
    rawNodes: Map<string | number, T>;
    matchKeys: Set<string | number>; // 命中的节点，用于 UI 高亮或过滤展示
    // 核心：在内存树中递归搜索 keyword，并保留父级路径
    searchLocal(): void;
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
    expandedKeys: Set<string>; // 展开的节点
    loadingKeys: Set<string>; // 正在加载子节点的节点 (Lazy 模式专用)
    loadedKeys: Set<string>; // 已经加载过子节点的节点 (避免 Lazy 模式重复请求)
    selectedKey?: string; // 当前选中的节点

    // 4. 根节点引用
    rootIds: string[];
}
