import { DomainConfig, SystemConfig } from '@orbitjs/registry';
import { GestureSemantic } from './events';
import {
    IDeletionPlan,
    IEntity,
    IFlatLocalEntityState,
    ILocalSearchParams,
    Schema,
} from './entities';

// ==================== 系统能力接口 ====================

/**
 * 事件能力接口
 * 提供基本的事件监听、一次性监听和事件发射功能
 */
export interface IEventAbility {
    /**
     * 监听事件
     * @param event 事件名称
     * @param listener 事件处理器函数
     * @returns 取消监听的函数
     */
    on(event: string, listener: Function): () => () => void;

    /**
     * 监听一次性事件
     * @param event 事件名称
     * @param listener 事件处理器函数
     */
    once(event: string, listener: Function): void;

    /**
     * 发射事件
     * @param event 事件名称
     * @param payload 传递的数据（可选）
     */
    emit(event: string, payload?: any): void;
}

/**
 * DOM事件能力接口
 * 提供绑定DOM事件到目标元素的能力
 */
export interface IDomEventsAbility extends IEventAbility {
    /**
     * 绑定DOM事件到目标元素
     * @param target 事件目标元素
     * @param semantic 手势语义类型
     * @param options 绑定选项
     */
    bind(target: EventTarget, semantic: GestureSemantic, options?: any): () => void;
}

/**
 * 域能力接口
 * 提供对域配置的访问能力
 */
export interface IDomainAbility {
    /** 域配置对象 */
    domainConfig: DomainConfig;
}

/**
 * 系统能力接口
 * 提供对系统级配置的访问能力
 */
export interface ISystemAbility {
    /**
     * 获取系统配置
     * @param key 可选的配置项键名
     * @returns 请求的配置值或整个配置对象
     */
    systemConfig<K extends keyof SystemConfig>(key?: K): Partial<SystemConfig> | any;
}

// ==================== 实体模式能力接口 ====================

/**
 * 模式能力接口
 * 提供实体结构定义和验证能力
 */
export interface ISchemaAbility {
    /** 获取原始Schema对象 */
    getSchema(): Schema;

    /** 获取校验规则 */
    getSchemaRules(fieldName?: string): Record<string, any> | any[];

    /** 模式字段键名映射 */
    readonly schemaKeys: {
        id: string;
        label: string;
        createdAt: string;
        updatedAt: string;
        parentId: string;
        children: string;
        path: string;
        leaf: string;
    };

    /** 模式排序配置 */
    readonly schemaSort: { prop: string; order: string };

    /** 模式树形结构配置 */
    readonly schemaTree: { isTree: boolean; isLazy: boolean; root: any };

    /** 模式预设过滤字段 */
    readonly schemaFilters: string[];

    /** 模式ID类型 */
    readonly schemaIdType: 'number' | 'string';
}

// ==================== 本地实体能力接口 ====================

/**
 * 本地扁平状态能力接口
 * 提供本地集合状态的访问和操作能力
 */
export interface IFlatLocalStateAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> {
    /** 加载状态 */
    readonly loading: boolean;

    /** 是否为空 */
    readonly isEmpty: boolean;

    /** 总数量 */
    readonly total: number;

    /** 项目列表 */
    readonly items: T[];

    /** 是否有变更 */
    readonly hasChanges: boolean;

    /**
     * 获取删除计划
     * @param ids 要删除的ID数组
     */
    getDeletionPlan(ids: (string | number)[]): IDeletionPlan;

    /** 添加项目的函数 */
    readonly adds: (items: T[]) => void;

    /** 更新项目的函数 */
    readonly updates: (items: Partial<T>[]) => void;
}

/**
 * 本地扁平变更能力接口
 * 提供本地数据的创建、更新、切换和保存能力
 */
export interface IFlatLocalMutationAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> {
    /**
     * 创建本地数据
     * @param item 要创建的项目
     */
    create(item: T): T;

    /**
     * 更新本地数据
     * @param item 要更新的项目
     */
    update(item: Partial<T>): T;

    /**
     * 切换字段值
     * @param item 项目对象
     * @param field 要切换的字段名
     */
    toggle(item: T, field: keyof T): void;

    /**
     * 保存变更到远程
     * @param isBatch 是否批量保存
     */
    save(isBatch: boolean): Promise<void>;
}

/**
 * 本地扁平删除能力接口
 * 提供本地数据删除能力
 */
export interface IFlatLocalDeleteAbility<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> {
    /**
     * 删除本地数据
     * @param ids 要删除的ID数组
     * @param immediate 是否立即同步到后端
     */
    delete(ids: (string | number)[], immediate?: boolean): Promise<IDeletionPlan>;
}

/**
 * 本地列表能力接口
 * 提供本地数据列表操作能力
 */
export interface ILocalListAbility<T extends IEntity, TC extends ILocalSearchParams> {
    /**
     * 获取列表数据
     * @param forceRefresh 是否强制刷新
     */
    list(forceRefresh: boolean): Promise<T[]>;

    /**
     * 过滤数据
     * @param text 过滤文本
     */
    filter(text: string): T[];

    /**
     * 搜索数据
     * @param criteria 搜索条件
     */
    search(criteria: Partial<TC>): T[];

    /**
     * 排序数据
     * @param key 排序字段
     * @param order 排序顺序
     */
    sort(key: string, order: any): T[];

    /** 应用本地处理逻辑 */
    applyLocalProcess(): T[];

    /** 刷新数据 */
    refresh(): Promise<T[]>;
}

// ==================== 远程实体能力接口 ====================

/**
 * 远程获取能力接口
 * 提供远程获取单个实体的能力
 */
export interface IRemoteGetAbility<T> {
    /**
     * 获取单个实体
     * @param id 实体ID
     */
    get(id: any): Promise<T>;
}

/**
 * 远程获取全部能力接口
 * 提供获取所有实体的能力
 */
export interface IFlatRemoteGetAllAbility<T> {
    /** 获取所有实体 */
    getAll(): Promise<T[]>;
}

/**
 * 远程列表能力接口
 * 提供远程列表查询能力
 */
export interface IFlatRemoteListAbility<T> {
    /** 获取列表数据 */
    list(forceRefresh?: boolean): Promise<T[]>;

    /** 刷新列表数据 */
    refresh(): Promise<T[]>;
}

/**
 * 远程创建能力接口
 * 提供远程创建实体的能力
 */
export interface IRemoteCreateAbility<T> {
    /**
     * 创建实体
     * @param data 实体数据
     */
    create(data: Partial<T>): Promise<T>;
}

/**
 * 远程更新能力接口
 * 提供远程更新实体的能力
 */
export interface IRemoteUpdateAbility<T> {
    /**
     * 更新实体
     * @param data 更新数据
     */
    update(data: Partial<T>): Promise<T>;
}

/**
 * 远程删除能力接口
 * 提供远程删除实体的能力
 */
export interface IRemoteDeleteAbility {
    /**
     * 删除实体
     * @param id 实体ID或ID数组
     */
    delete(id: any): Promise<void>;
}

/**
 * 远程切换能力接口
 * 提供远程切换实体字段值的能力
 */
export interface IRemoteToggleAbility<T> {
    /**
     * 切换字段值
     * @param item 实体对象
     * @param field 要切换的字段名
     */
    toggle(item: T, field: keyof T): Promise<T>;
}

/**
 * 远程查询能力接口
 * 提供分页、过滤、排序等查询能力
 */
export interface IFlatRemoteQueryAbility<T, TC> {
    /** 上一页 */
    prev(): Promise<T[]> | any[];

    /** 下一页 */
    next(): Promise<T[]> | any[];

    /** 跳转到指定页 */
    jump(page: number): Promise<T[]> | void;

    /** 更改页面大小 */
    changeSize(size: number): Promise<T[]> | void;

    /** 过滤查询 */
    filter(text: string): Promise<T[]>;

    /** 搜索查询 */
    search(criteria: Partial<TC>): Promise<T[]>;

    /** 排序 */
    sort(prop: string, order: 'asc' | 'desc' | null): Promise<T[]>;

    /** 刷新 */
    refresh(): Promise<T[]>;

    /** 重置查询条件 */
    reset(): Promise<T[]>;
}

export interface IFlatRemoteStateAbility<T> {
    loading: boolean;
    isEmpty: boolean;
    hasMore: boolean;
    total: number;
    items: T[];
    page: number;
    pageSize: number;
    pages: number;
    pageSizes: number[];
    isDirty(currentItem:T):boolean;
    edit(item:Partial<T>):void;
    roolback():void;
}

export interface ITreeManagerAbility<T>{
    expand(item:T):void;
    collapse(item:T):void;
    move(id: string | number, targetPid: string | number | null):void;
    refresh():void;
    getSubTree(pid: string | number):T[];
    isDirty(currentItem:T):boolean;
    edit(item:Partial<T>):void;
    roolback():void;
}

export interface ITreeRemoteStateAbility<T>{
    loading: boolean;
    isEmpty: boolean;
    items: T[];
}