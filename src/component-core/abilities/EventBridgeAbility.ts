/**
 * EventBridgeAbility 事件桥接能力
 *
 * 声明式配置事件源，自动创建监听。
 * 利用 onCleanup 自动销毁，组件 dispose 时无需手动清理。
 *
 * 通过 getEventBridge/setEventBridge 方法访问配置，
 * 不再将 eventBridge 属性暴露到组件顶层。
 *
 * 桥接策略（基于 EventBridge 单例）：
 * - 所有桥接事件通过 EventBridge 单例的统一 eventScope 收发
 * - 发送方调用 EventBridge.bridgeEmit(sourceId, eventName, data)
 * - 监听方调用 EventBridge.bridgeOn(sourceId, eventName, handler)
 * - 发送和监听使用同一个 eventScope，scopeId 统一，事件路由可靠
 * - 不再依赖源组件实例是否存在，监听方可先于发送方注册
 *
 * 内置桥接类型：
 * - pagination: 监听 pagechange → onPageChange
 * - crud: 监听 crudaction → onCreate/onEdit/onDelete/...
 * - selection: 监听 selectionchange → onSelectionChange
 * - search: 监听 searchchange → onSearchChange
 * - 自定义: key 即事件名（如 click、input、change），
 *   match 用于只监听关心的细分事件（如 change:product、click:submitBtn）
 *
 * @example
 * ```js
 * // 字符串简写
 * component.setEventBridge({
 *     pagination: 'myToolbar',
 *     crud: 'myToolbar',
 *     selection: 'myGrid'
 * });
 *
 * // 自定义桥接
 * component.setEventBridge({
 *     click: { source: 'myBtn' },                    // 监听 click
 *     change: { source: 'router', match: 'product' } // 只监听 change:product
 * });
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_EVENTS, CRUD_EVENTS, SELECTION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events';

/**
 * 分页桥接配置
 */
export interface PaginationBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 是否启用，默认 true */
    enabled?: boolean;
}

/**
 * CRUD 桥接配置
 */
export interface CrudBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 需要监听的 action 列表，不传则监听所有 */
    actions?: string[];
    /** 是否启用，默认 true */
    enabled?: boolean;
}

/**
 * 选择桥接配置
 */
export interface SelectionBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 是否启用，默认 true */
    enabled?: boolean;
}

/**
 * 搜索桥接配置
 */
export interface SearchBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 是否启用，默认 true */
    enabled?: boolean;
}

/**
 * 自定义桥接配置
 *
 * key 即事件名（如 click、input、change）。
 * - 组件内部只有一个同类事件时，直接发 key（如 click）
 * - 组件内部有多个同类事件时，发 key:标识（如 click:submitBtn）来区分
 * - 路由发 change 或 change:路径
 *
 * match 用于只监听关心的细分事件，避免全监听后再 if 判断：
 * - 不传：监听 key 本身（如 click、change）
 * - 'a,b,c'：只监听 key:a、key:b、key:c
 */
export interface CustomBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 目标处理方法名，默认为 on + 首字母大写 key */
    handler?: string;
    /**
     * 事件粒度匹配 — 只监听关心的细分事件
     *
     * - 不传：监听 key 本身（如 click、change）
     * - 'a,b,c'：只监听 key:a、key:b、key:c
     *
     * 用于路由路径匹配（如 match: 'product' 只监听 change:product）
     * 或区分同组件内多个同类事件（如 match: 'submitBtn' 只监听 click:submitBtn）
     */
    match?: string;
    /** 是否启用，默认 true */
    enabled?: boolean;
}

/**
 * 事件桥接配置
 *
 * 值可以是字符串（简写为 source id）或完整配置对象
 */
export interface EventBridgeConfig {
    /** 分页桥接 */
    pagination?: PaginationBridgeConfig | string;
    /** CRUD 桥接 */
    crud?: CrudBridgeConfig | string;
    /** 选择桥接 */
    selection?: SelectionBridgeConfig | string;
    /** 搜索桥接 */
    search?: SearchBridgeConfig | string;
    /** 自定义桥接 */
    [key: string]: any;
}

/** 内置桥接 key 集合 */
const BUILTIN_BRIDGE_KEYS = new Set(['pagination', 'crud', 'selection', 'search']);

/**
 * 标准化桥接配置（将字符串简写转为对象）
 */
function normalizeBridgeConfig(value: any): { source: string; [key: string]: any } | null {
    if (!value) return null;
    if (typeof value === 'string') return { source: value };
    if (typeof value === 'object' && value.source) return value;
    return null;
}

export const EventBridgeConfigAbility: AbilityDefinition = {
    /**
     * 获取事件桥接配置
     */
    getEventBridge(): EventBridgeConfig {
        return this.abilityState('EventBridgeAbility:config', () => ({}));
    },

    /**
     * 设置事件桥接配置
     */
    setEventBridge(value: EventBridgeConfig): void {
        this.setAbilityState('EventBridgeAbility:config', value);
    },

    /**
     * 初始化事件桥接
     *
     * 根据 eventBridge 配置，通过 EventBridge 单例创建事件监听。
     * 所有监听注册在 EventBridge 的统一 eventScope 上，确保 scopeId 一致。
     * 组件 dispose 时通过 onCleanup 自动解绑。
     */
    initEventBridge(): void {
        const config = this.getEventBridge();
        if (!config) return;

        this.logger?.debug?.('[EventBridge] initEventBridge, config keys =', Object.keys(config));

        // 分页桥接
        const paginationCfg = normalizeBridgeConfig(config.pagination);
        if (paginationCfg && paginationCfg.enabled !== false) {
            this._bridgeOn(paginationCfg.source, PAGINATION_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onPageChange === 'function') {
                    this.onPageChange(e);
                }
            });
        }

        // CRUD 桥接
        const crudCfg = normalizeBridgeConfig(config.crud);
        if (crudCfg && crudCfg.enabled !== false) {
            const allowedActions = crudCfg.actions ? new Set(crudCfg.actions) : null;
            this._bridgeOn(crudCfg.source, CRUD_EVENTS.ACTION, (e: any) => {
                const action = e?.action;
                if (!action) return;
                if (allowedActions && !allowedActions.has(action)) return;
                const methodName = `on${action.charAt(0).toUpperCase() + action.slice(1)}`;
                if (typeof (this as any)[methodName] === 'function') {
                    (this as any)[methodName](e);
                }
            });
        }

        // 选择桥接
        const selectionCfg = normalizeBridgeConfig(config.selection);
        if (selectionCfg && selectionCfg.enabled !== false) {
            this._bridgeOn(selectionCfg.source, SELECTION_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onSelectionChange === 'function') {
                    this.onSelectionChange(e);
                }
            });
        }

        // 搜索桥接
        const searchCfg = normalizeBridgeConfig(config.search);
        if (searchCfg && searchCfg.enabled !== false) {
            this._bridgeOn(searchCfg.source, SEARCH_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onSearchChange === 'function') {
                    this.onSearchChange(e);
                }
            });
        }

        // 自定义桥接
        // key 即事件名（如 click、input、change）
        // match 用于只监听关心的细分事件（如 change:product、click:submitBtn）
        for (const [key, rawCfg] of Object.entries(config)) {
            if (BUILTIN_BRIDGE_KEYS.has(key)) continue;
            const cfg = normalizeBridgeConfig(rawCfg);
            if (!cfg || cfg.enabled === false) continue;

            const methodName = cfg.handler || `on${key.charAt(0).toUpperCase() + key.slice(1)}`;
            const match = cfg.match;

            if (!match) {
                // 无 match：监听 key 本身（如 click、change）
                this._bridgeOn(cfg.source, key, (e: any) => {
                    if (typeof (this as any)[methodName] === 'function') {
                        (this as any)[methodName](e);
                    }
                });
            } else if (match === '*') {
                // match = '*'：监听 key 本身即可（Router 每次 change 都会 emit key 本身）
                // 细分事件（如 change:icons）是额外发出的，key 本身已包含完整信息
                this._bridgeOn(cfg.source, key, (e: any) => {
                    if (typeof (this as any)[methodName] === 'function') {
                        (this as any)[methodName](e);
                    }
                });
            } else {
                // 有 match：只监听 key:match值（如 change:product、click:submitBtn）
                const suffixes = match.split(',').map((s: string) => s.trim()).filter(Boolean);
                for (const suffix of suffixes) {
                    const eventName = `${key}:${suffix}`;
                    this._bridgeOn(cfg.source, eventName, (e: any) => {
                        if (typeof (this as any)[methodName] === 'function') {
                            (this as any)[methodName](e);
                        }
                    });
                }
            }
        }
    },

    /**
     * 桥接监听：通过系统能力 this.bridgeOn() 注册事件
     *
     * this.bridgeOn() 由 EventBridgeAbility（系统能力）提供，
     * 内部调用 EventBridge 单例，自动管理生命周期。
     */
    _bridgeOn(sourceId: string, eventName: string, handler: (e: any) => void): void {
        this.logger?.debug?.('[EventBridge] _bridgeOn, sourceId =', sourceId, 'eventName =', eventName);
        this.bridgeOn(sourceId, eventName, handler);
    },

    /**
     * 从 props 初始化
     *
     * 不再需要 queueMicrotask 延迟绑定，因为 EventBridge 单例
     * 不依赖源组件实例是否存在，监听方可先于发送方注册。
     */
    __initProps(props: Record<string, any>): void {
        if (props.eventBridge) {
            this.setEventBridge(props.eventBridge);
            this.initEventBridge();
        }
    },
};
