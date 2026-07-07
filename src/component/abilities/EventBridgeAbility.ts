/**
 * EventBridgeAbility 事件桥接能力
 *
 * 声明式配置事件源和目标，自动创建监听。
 * 解决工具栏与数据组件（Table/Form）之间的事件绑定问题。
 *
 * 核心思路：
 * - 工具栏只管发事件（pagechange / crudaction）
 * - 数据组件声明"我要监听谁的事件"
 * - EventBridge 自动创建监听，调用目标组件的对应方法
 *
 * @example
 * ```js
 * // 布局定义
 * { type: 'Table', id: 'myTable',
 *   eventBridge: {
 *     pagination: { source: 'myToolbar' },
 *     crud: { source: 'myToolbar', actions: ['create', 'delete', 'refresh'] }
 *   }
 * }
 *
 * // 等价于手动写：
 * // toolbar.on('pagechange', (e) => table.onPageChange(e));
 * // toolbar.on('crudaction', (e) => { if (e.action === 'create') table.onCreate(); ... });
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 分页桥接配置
 */
export interface PaginationBridgeConfig {
    /** 事件源组件 id（通常是工具栏） */
    source: string;
    /** 是否自动响应分页事件，默认 true */
    enabled?: boolean;
}

/**
 * CRUD 桥接配置
 */
export interface CrudBridgeConfig {
    /** 事件源组件 id（通常是工具栏） */
    source: string;
    /** 需要监听的 action 列表，不传则监听所有 */
    actions?: string[];
    /** 是否自动响应 CRUD 事件，默认 true */
    enabled?: boolean;
}

/**
 * 事件桥接配置
 */
export interface EventBridgeConfig {
    /** 分页桥接 */
    pagination?: PaginationBridgeConfig;
    /** CRUD 桥接 */
    crud?: CrudBridgeConfig;
    /** 自定义桥接 */
    [key: string]: any;
}

/** 已绑定的解绑函数列表 */
type UnsubscribeFn = () => void;

export const EventBridgeAbility: AbilityDefinition = {
    /**
     * eventBridge 配置
     */
    eventBridge: {
        get(): EventBridgeConfig {
            return this.abilityState('EventBridgeAbility:config', () => ({}));
        },
        set(value: EventBridgeConfig): void {
            this.setAbilityState('EventBridgeAbility:config', value);
        },
    },

    /**
     * 已绑定的解绑函数
     */
    _bridgeUnsubscribes: {
        get(): UnsubscribeFn[] {
            return this.abilityState('EventBridgeAbility:unsubscribes', () => []);
        },
    },

    /**
     * 初始化事件桥接
     *
     * 根据 eventBridge 配置，自动查找源组件并创建事件监听。
     * 应在 mount() 后调用（此时组件已注册到 ComponentManager）。
     */
    initEventBridge(): void {
        // 先清理旧绑定
        this.destroyEventBridge();

        const config = this.eventBridge;
        if (!config) return;

        const { ComponentManager } = require('../ComponentManager');
        const mgr = ComponentManager.getInstance();

        // 分页桥接
        if (config.pagination) {
            this._bindPagination(config.pagination, mgr);
        }

        // CRUD 桥接
        if (config.crud) {
            this._bindCrud(config.crud, mgr);
        }

        // 自定义桥接
        for (const [key, bridgeConfig] of Object.entries(config)) {
            if (key === 'pagination' || key === 'crud') continue;
            if (bridgeConfig && typeof bridgeConfig === 'object' && (bridgeConfig as any).source) {
                this._bindCustom(key, bridgeConfig as any, mgr);
            }
        }
    },

    /**
     * 销毁事件桥接
     *
     * 移除所有自动创建的事件监听
     */
    destroyEventBridge(): void {
        const unsubscribes = this._bridgeUnsubscribes;
        for (const fn of unsubscribes) {
            fn();
        }
        unsubscribes.length = 0;
    },

    // ============================================
    // 内部绑定方法
    // ============================================

    /**
     * 绑定分页事件
     */
    _bindPagination(config: PaginationBridgeConfig, mgr: any): void {
        if (config.enabled === false) return;

        const source = mgr.get(config.source);
        if (!source) return;

        const handler = (e: any) => {
            if (typeof this.onPageChange === 'function') {
                this.onPageChange(e);
            }
        };

        source.on?.('pagechange', handler);

        this._bridgeUnsubscribes.push(() => {
            source.off?.('pagechange', handler);
        });
    },

    /**
     * 绑定 CRUD 事件
     */
    _bindCrud(config: CrudBridgeConfig, mgr: any): void {
        if (config.enabled === false) return;

        const source = mgr.get(config.source);
        if (!source) return;

        const allowedActions = config.actions ? new Set(config.actions) : null;

        const handler = (e: any) => {
            const action = e?.action;
            if (!action) return;

            // 过滤 action
            if (allowedActions && !allowedActions.has(action)) return;

            // 调用目标组件的对应方法
            const methodName = `on${action.charAt(0).toUpperCase() + action.slice(1)}`;
            if (typeof (this as any)[methodName] === 'function') {
                (this as any)[methodName](e);
            }
        };

        source.on?.('crudaction', handler);

        this._bridgeUnsubscribes.push(() => {
            source.off?.('crudaction', handler);
        });
    },

    /**
     * 绑定自定义事件
     */
    _bindCustom(key: string, config: any, mgr: any): void {
        const source = mgr.get(config.source);
        if (!source) return;

        const eventName = config.event || key;
        const methodName = config.handler || `on${key.charAt(0).toUpperCase() + key.slice(1)}`;

        const handler = (e: any) => {
            if (typeof (this as any)[methodName] === 'function') {
                (this as any)[methodName](e);
            }
        };

        source.on?.(eventName, handler);

        this._bridgeUnsubscribes.push(() => {
            source.off?.(eventName, handler);
        });
    },

    /**
     * 从 props 初始化
     *
     * 使用 queueMicrotask 延迟绑定，确保同一轮 mount 的所有组件
     * 都已注册到 ComponentManager 后再查找源组件
     */
    __initProps(props: Record<string, any>): void {
        if (props.eventBridge) {
            this.eventBridge = props.eventBridge;
            // 延迟到微任务，确保源组件也已注册
            queueMicrotask(() => {
                if (!this.destroyed) {
                    this.initEventBridge();
                }
            });
        }
    },
};
