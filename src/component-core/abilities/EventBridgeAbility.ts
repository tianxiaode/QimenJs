/**
 * EventBridgeAbility 事件桥接能力
 *
 * 声明式配置事件源，自动创建监听。
 * 利用 onCleanup 自动销毁，组件 dispose 时无需手动清理。
 *
 * 通过 getEventBridge/setEventBridge 方法访问配置，
 * 不再将 eventBridge 属性暴露到组件顶层。
 *
 * 内置桥接类型：
 * - pagination: 监听 pagechange → onPageChange
 * - crud: 监听 crudaction → onCreate/onEdit/onDelete/...
 * - selection: 监听 selectionchange → onSelectionChange
 * - search: 监听 searchchange → onSearchChange
 * - 自定义: 任意 key → 监听指定 event → 调用指定 handler
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
 * // 完整配置
 * component.setEventBridge({
 *     pagination: { source: 'myToolbar' },
 *     crud: { source: 'myToolbar', actions: ['create', 'delete'] },
 *     selection: { source: 'myGrid' }
 * });
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_EVENTS, CRUD_EVENTS, SELECTION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { globalEventBus } from '@qimenjs/events';

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
 */
export interface CustomBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 监听的事件名，默认为 key 名 */
    event?: string;
    /** 目标处理方法名，默认为 on + 首字母大写 key */
    handler?: string;
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

export const EventBridgeAbility: AbilityDefinition = {
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
     * 根据 eventBridge 配置，自动创建事件监听。
     * 组件 dispose 时通过 onCleanup 自动解绑。
     */
    initEventBridge(): void {
        const config = this.getEventBridge();
        if (!config) return;

        const mgr = ComponentRegistrar.getInstance();

        // 分页桥接
        const paginationCfg = normalizeBridgeConfig(config.pagination);
        if (paginationCfg && paginationCfg.enabled !== false) {
            this._bridgeOn(paginationCfg.source, PAGINATION_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onPageChange === 'function') {
                    this.onPageChange(e);
                }
            }, mgr);
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
            }, mgr);
        }

        // 选择桥接
        const selectionCfg = normalizeBridgeConfig(config.selection);
        if (selectionCfg && selectionCfg.enabled !== false) {
            this._bridgeOn(selectionCfg.source, SELECTION_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onSelectionChange === 'function') {
                    this.onSelectionChange(e);
                }
            }, mgr);
        }

        // 搜索桥接
        const searchCfg = normalizeBridgeConfig(config.search);
        if (searchCfg && searchCfg.enabled !== false) {
            this._bridgeOn(searchCfg.source, SEARCH_EVENTS.CHANGE, (e: any) => {
                if (typeof this.onSearchChange === 'function') {
                    this.onSearchChange(e);
                }
            }, mgr);
        }

        // 自定义桥接
        for (const [key, rawCfg] of Object.entries(config)) {
            if (BUILTIN_BRIDGE_KEYS.has(key)) continue;
            const cfg = normalizeBridgeConfig(rawCfg);
            if (!cfg || cfg.enabled === false) continue;

            const eventName = cfg.event || key;
            const methodName = cfg.handler || `on${key.charAt(0).toUpperCase() + key.slice(1)}`;

            this._bridgeOn(cfg.source, eventName, (e: any) => {
                if (typeof (this as any)[methodName] === 'function') {
                    (this as any)[methodName](e);
                }
            }, mgr);
        }
    },

    /**
     * 桥接监听：在源组件上注册事件，通过 onCleanup 管理生命周期
     */
    _bridgeOn(sourceId: string, eventName: string, handler: (e: any) => void, mgr: any): void {
        // router 源：直接监听 globalEventBus 上的路由事件
        if (sourceId === 'router') {
            const off = globalEventBus.on(eventName, (ctx: any) => {
                handler(ctx.data);
            });
            this.onCleanup(off);
            return;
        }

        const source = mgr.getInstance(sourceId);
        if (!source) return;

        const off = source.on?.(eventName, handler);

        if (typeof off === 'function') {
            this.onCleanup(off);
        }
    },

    /**
     * 从 props 初始化
     *
     * 使用 queueMicrotask 延迟绑定，确保同一轮 mount 的所有组件
     * 都已注册到 ComponentRegistrar 后再查找源组件
     */
    __initProps(props: Record<string, any>): void {
        if (props.eventBridge) {
            this.setEventBridge(props.eventBridge);
            queueMicrotask(() => {
                if (!this.destroyed) {
                    this.initEventBridge();
                }
            });
        }
    },
};
