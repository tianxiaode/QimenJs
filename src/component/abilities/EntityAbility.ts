/**
 * EntityAbility 实体管理能力
 *
 * 提供 mgr 属性和 entityConfig 配置，自动代理 mgr 的公共方法到组件实例。
 * 增强功能：
 * - 选择能力：selectedIds/hasSelection/selectAll/deselectAll/isSelected/toggleSelect
 * - 事件转发：将 EntityManager 事件转发为组件事件（entity:*）
 * - 事件桥接：通过 eventBridge.selection 配置选择源
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { ENTITY_EVENTS, SELECTION_EVENTS } from '../events';

/**
 * 首字母大写
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const EntityAbility: AbilityDefinition = {
    /**
     * EntityManager 实例
     */
    mgr: {
        get(): any {
            return this.abilityState('EntityAbility:mgr', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityAbility:mgr', value);
        },
    },

    /**
     * entityConfig 配置
     */
    entityConfig: {
        get(): any {
            return this.abilityState('EntityAbility:config', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityAbility:config', value);
        },
    },

    // ============================================
    // 选择能力
    // ============================================

    /**
     * 已选中的 ID 集合
     */
    selectedIds: {
        get(): Set<string | number> {
            return this.abilityState('EntityAbility:selectedIds', () => new Set());
        },
        set(value: Set<string | number>): void {
            this.setAbilityState('EntityAbility:selectedIds', value);
        },
    },

    /**
     * 选择模式：'single' | 'multi' | 'none'
     */
    selectionMode: {
        get(): string {
            return this.abilityState('EntityAbility:selectionMode', () => 'multi');
        },
        set(value: string): void {
            this.setAbilityState('EntityAbility:selectionMode', value);
        },
    },

    /**
     * 是否有选中项
     */
    hasSelection: {
        get(): boolean {
            return this.selectedIds.size > 0;
        },
    },

    /**
     * 选中数量
     */
    selectionCount: {
        get(): number {
            return this.selectedIds.size;
        },
    },

    /**
     * 选中指定 ID
     */
    select(id: string | number): void {
        if (this.selectionMode === 'none') return;

        // 单选模式：先清空
        if (this.selectionMode === 'single' && this.selectedIds.size > 0) {
            this.selectedIds.clear();
        }

        this.selectedIds.add(id);
        this._emitSelectionChange();
    },

    /**
     * 取消选中指定 ID
     */
    deselect(id: string | number): void {
        this.selectedIds.delete(id);
        this._emitSelectionChange();
    },

    /**
     * 切换选中状态
     */
    toggleSelect(id: string | number): void {
        if (this.selectedIds.has(id)) {
            this.deselect(id);
        } else {
            this.select(id);
        }
    },

    /**
     * 判断是否选中
     */
    isSelected(id: string | number): boolean {
        return this.selectedIds.has(id);
    },

    /**
     * 全选（当前页数据）
     */
    selectAll(ids?: Array<string | number>): void {
        if (this.selectionMode === 'none' || this.selectionMode === 'single') return;

        if (ids) {
            for (const id of ids) {
                this.selectedIds.add(id);
            }
        } else if (this.mgr?.items) {
            const idField = this.entityConfig?.idField || 'id';
            for (const item of this.mgr.items) {
                this.selectedIds.add(item[idField]);
            }
        }
        this._emitSelectionChange();
    },

    /**
     * 全部取消选中
     */
    deselectAll(): void {
        this.selectedIds.clear();
        this._emitSelectionChange();
    },

    /**
     * 获取选中的 ID 数组
     */
    getSelectedIds(): Array<string | number> {
        return Array.from(this.selectedIds);
    },

    /**
     * 获取选中的数据行
     */
    getSelectedItems(): any[] {
        if (!this.mgr?.items) return [];
        const idField = this.entityConfig?.idField || 'id';
        return this.mgr.items.filter((item: any) => this.selectedIds.has(item[idField]));
    },

    /**
     * 发射选择变更事件
     */
    _emitSelectionChange(): void {
        const data = {
            selectedIds: this.getSelectedIds(),
            selectedItems: this.getSelectedItems(),
            count: this.selectionCount,
        };
        this.emit?.(SELECTION_EVENTS.CHANGE, data);
        this.emit?.(ENTITY_EVENTS.SELECTION_CHANGE, data);
    },

    // ============================================
    // 初始化
    // ============================================

    /**
     * 初始化实体管理
     */
    __init__: '_initEntity',

    _initEntity(): void {
        const config = this.entityConfig;
        if (!config) return;

        // 1. 根据 entityConfig 创建 EntityManager
        if (config.domain && config.schema && config.type) {
            try {
                const { createEntityManager } = require('@qimenjs/entity');
                if (typeof createEntityManager === 'function') {
                    this.mgr = createEntityManager(config);
                }
            } catch (e) {
                console.error('EntityAbility: failed to create EntityManager', e);
            }
        }

        // 2. 代理 mgr 的公共方法到组件实例
        if (this.mgr) {
            this._proxyMgrMethods();
        }

        // 3. 注册事件源 + 转发 EntityManager 事件
        if (this.id && this.mgr) {
            this._registerEventSource();
            this._forwardEntityEvents();
        }

        // 4. 初始化选择模式
        if (config.selectionMode) {
            this.selectionMode = config.selectionMode;
        }
    },

    /**
     * 注册事件源到 EventSourceRegistrar
     */
    _registerEventSource(): void {
        try {
            const { EventSourceRegistrar } = require('@qimenjs/events');
            EventSourceRegistrar.getInstance().register(this.id, this);
        } catch (e) {
            // EventSourceRegistrar 不可用
        }
    },

    /**
     * 转发 EntityManager 事件为组件事件
     *
     * EntityManager 事件 → 组件事件（entity:* 前缀）
     * 组件 dispose 时通过 onCleanup 自动解绑
     */
    _forwardEntityEvents(): void {
        const mgr = this.mgr;
        if (!mgr || typeof mgr.on !== 'function') return;

        // 数据变更
        const offDataChange = mgr.on('dataChange', () => {
            this.emit?.(ENTITY_EVENTS.DATA_CHANGE, { source: this.id });
        });
        if (typeof offDataChange === 'function') this.onCleanup(offDataChange);

        // 列表加载完成
        const offListed = mgr.on('listed', (items: any) => {
            this.emit?.(ENTITY_EVENTS.LISTED, { items });
        });
        if (typeof offListed === 'function') this.onCleanup(offListed);

        // CRUD 结果
        const offCreated = mgr.on('created', (item: any) => {
            this.emit?.(ENTITY_EVENTS.CREATED, { item });
        });
        if (typeof offCreated === 'function') this.onCleanup(offCreated);

        const offUpdated = mgr.on('updated', (item: any) => {
            this.emit?.(ENTITY_EVENTS.UPDATED, { item });
        });
        if (typeof offUpdated === 'function') this.onCleanup(offUpdated);

        const offDeleted = mgr.on('deleted', (ids: any) => {
            this.emit?.(ENTITY_EVENTS.DELETED, { ids });
        });
        if (typeof offDeleted === 'function') this.onCleanup(offDeleted);

        const offSaved = mgr.on('saved', () => {
            this.emit?.(ENTITY_EVENTS.SAVED, {});
        });
        if (typeof offSaved === 'function') this.onCleanup(offSaved);

        const offToggled = mgr.on('toggled', (data: any) => {
            this.emit?.(ENTITY_EVENTS.TOGGLED, data);
        });
        if (typeof offToggled === 'function') this.onCleanup(offToggled);

        // 请求状态
        const offLoading = mgr.on('list:loading', (loading: boolean) => {
            this.emit?.(ENTITY_EVENTS.LOADING, { action: 'list', loading });
        });
        if (typeof offLoading === 'function') this.onCleanup(offLoading);

        const offSuccess = mgr.on('list:success', (ctx: any) => {
            this.emit?.(ENTITY_EVENTS.LOADED, { action: 'list', data: ctx?.data });
        });
        if (typeof offSuccess === 'function') this.onCleanup(offSuccess);

        const offError = mgr.on('list:error', (ctx: any) => {
            this.emit?.(ENTITY_EVENTS.ERROR, { action: 'list', error: ctx?.error });
        });
        if (typeof offError === 'function') this.onCleanup(offError);
    },

    /**
     * 代理 mgr 的公共方法到组件实例
     */
    _proxyMgrMethods(): void {
        const mgr = this.mgr;
        if (!mgr) return;

        const methodNames = this._getMgrMethodNames();
        for (const name of methodNames) {
            if (typeof mgr[name] === 'function' && !this[name]) {
                this[name] = this._createProxyMethod(name);
            }
        }
    },

    /**
     * 创建代理方法（含 before/after 钩子）
     */
    _createProxyMethod(methodName: string): (...args: any[]) => any {
        return function(this: any, ...args: any[]): any {
            const beforeHook = this[`before${capitalize(methodName)}`];
            const afterHook = this[`after${capitalize(methodName)}`];

            if (typeof beforeHook === 'function') {
                const result = beforeHook.apply(this, args);
                if (result === false) return;
            }

            const mgrResult = this.mgr[methodName](...args);

            if (typeof afterHook === 'function') {
                afterHook.call(this, mgrResult);
            }

            return mgrResult;
        };
    },

    /**
     * 获取 mgr 的公共方法名列表
     */
    _getMgrMethodNames(): string[] {
        const mgr = this.mgr;
        if (!mgr) return [];

        return Object.getOwnPropertyNames(Object.getPrototypeOf(mgr))
            .filter(name => name !== 'constructor' && typeof mgr[name] === 'function');
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.entityConfig) this.entityConfig = props.entityConfig;
        if (props.selectionMode) this.selectionMode = props.selectionMode;
    },
};
