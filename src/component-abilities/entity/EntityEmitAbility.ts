/**
 * EntityEmitAbility 实体发送能力
 *
 * 监听 EntityManager 事件，转发为组件事件（entity:* 前缀）。
 * 事件流方向：entity → 组件
 *
 * 转发的事件包含完整的上下文数据（分页信息等）：
 * - 数据变更：dataChange → entity:datachange
 * - CRUD 结果：created/updated/deleted/saved/toggled → entity:created 等
 * - 列表加载：listed → entity:listed（含 total/page/pageSize/pages/hasMore）
 * - 单项获取：got → entity:got
 * - 树操作：expanded/collapsed/moved/childrenRefreshed → entity:expanded 等
 * - 搜索变更：searchChange → entity:searchchange（含搜索参数和分页信息）
 * - 请求状态：{action}:loading/success/error → entity:loading/loaded/error
 *
 * 钩子函数约定：
 * - `onEntity{EventName}(data)` — 事件转发前的钩子
 * - 返回 false 阻止转发
 * - 返回对象替换转发数据
 * - 无返回值则正常转发
 *
 * 配合 EntityCoreAbility（核心管理）和 EntityListenAbility（组件事件监听）使用。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_TREE_EVENTS,
    ENTITY_SEARCH_EVENTS,
    ENTITY_REQUEST_STATUS,
    buildRequestEvent,
    ENTITY_EVENTS,
} from '@qimenjs/events';

/**
 * 从 mgr 收集分页等上下文信息
 */
function collectPaginationContext(mgr: any): Record<string, any> {
    const ctx: Record<string, any> = {};
    if (mgr.total !== undefined) ctx.total = mgr.total;
    if (mgr.page !== undefined) ctx.page = mgr.page;
    if (mgr.pageSize !== undefined) ctx.pageSize = mgr.pageSize;
    if (mgr.pages !== undefined) ctx.pages = mgr.pages;
    if (mgr.hasMore !== undefined) ctx.hasMore = mgr.hasMore;
    return ctx;
}

export const EntityEmitAbility: AbilityDefinition = {
    // ============================================
    // 初始化
    // ============================================

    __init__: '_initEntityEmit',

    _initEntityEmit(): void {
        if (this.id && this.mgr) {
            this._registerEventSource();
            this._forwardEntityEvents();
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

    // ============================================
    // 事件转发
    // ============================================

    /**
     * 转发 EntityManager 事件为组件事件
     *
     * EntityManager 事件 → 组件事件（entity:* 前缀）
     * 组件 dispose 时通过 onCleanup 自动解绑
     *
     * 转发数据包含完整的上下文信息（分页等）。
     * 每个事件转发前调用对应的钩子函数，钩子可修改数据、阻止转发或执行额外逻辑。
     */
    _forwardEntityEvents(): void {
        const mgr = this.mgr;
        if (!mgr || typeof mgr.on !== 'function') return;

        // ---- 数据变更事件 ----
        this._forwardEvent(mgr, ENTITY_DATA_EVENTS.DATA_CHANGE, ENTITY_EVENTS.DATA_CHANGE, () => ({
            source: this.id,
            ...collectPaginationContext(mgr),
        }), 'onEntityDataChange');

        // ---- CRUD 结果事件 ----
        this._forwardEvent(mgr, ENTITY_CRUD_EVENTS.CREATED, ENTITY_EVENTS.CREATED, (item: any) => ({
            item,
        }), 'onEntityCreated');

        this._forwardEvent(mgr, ENTITY_CRUD_EVENTS.UPDATED, ENTITY_EVENTS.UPDATED, (item: any) => ({
            item,
        }), 'onEntityUpdated');

        this._forwardEvent(mgr, ENTITY_CRUD_EVENTS.DELETED, ENTITY_EVENTS.DELETED, (ids: any) => ({
            ids,
        }), 'onEntityDeleted');

        this._forwardEvent(mgr, ENTITY_CRUD_EVENTS.SAVED, ENTITY_EVENTS.SAVED, () => ({}), 'onEntitySaved');

        this._forwardEvent(mgr, ENTITY_CRUD_EVENTS.TOGGLED, ENTITY_EVENTS.TOGGLED, (rawData: any) => rawData, 'onEntityToggled');

        // ---- 列表加载事件（含分页信息） ----
        this._forwardEvent(mgr, ENTITY_LIST_EVENTS.LISTED, ENTITY_EVENTS.LISTED, (items: any) => ({
            items,
            ...collectPaginationContext(mgr),
        }), 'onEntityListed');

        this._forwardEvent(mgr, ENTITY_LIST_EVENTS.GOT, ENTITY_EVENTS.GOT, (item: any) => ({
            item,
        }), 'onEntityGot');

        // ---- 树操作事件 ----
        this._forwardEvent(mgr, ENTITY_TREE_EVENTS.EXPANDED, ENTITY_EVENTS.EXPANDED, (data: any) => data, 'onEntityExpanded');

        this._forwardEvent(mgr, ENTITY_TREE_EVENTS.COLLAPSED, ENTITY_EVENTS.COLLAPSED, (data: any) => data, 'onEntityCollapsed');

        this._forwardEvent(mgr, ENTITY_TREE_EVENTS.MOVED, ENTITY_EVENTS.MOVED, (data: any) => data, 'onEntityMoved');

        this._forwardEvent(mgr, ENTITY_TREE_EVENTS.CHILDREN_REFRESHED, ENTITY_EVENTS.CHILDREN_REFRESHED, (data: any) => ({
            ...data,
            ...collectPaginationContext(mgr),
        }), 'onEntityChildrenRefreshed');

        // ---- 搜索变更事件 ----
        this._forwardEvent(mgr, ENTITY_SEARCH_EVENTS.CHANGE, ENTITY_EVENTS.SEARCH_CHANGE, (searchData: any) => ({
            search: searchData,
            ...collectPaginationContext(mgr),
        }), 'onEntitySearchChange');

        // ---- 请求状态事件 ----
        const requestActions = ['list', 'create', 'update', 'delete', 'toggle', 'batch-delete', 'batch-save'];
        for (const action of requestActions) {
            this._forwardEvent(mgr, buildRequestEvent(action, ENTITY_REQUEST_STATUS.LOADING), ENTITY_EVENTS.LOADING, (loading: boolean) => ({
                action,
                loading,
            }), 'onEntityLoading');

            this._forwardEvent(mgr, buildRequestEvent(action, ENTITY_REQUEST_STATUS.SUCCESS), ENTITY_EVENTS.LOADED, (ctx: any) => ({
                action,
                data: ctx?.data,
                ...collectPaginationContext(mgr),
            }), 'onEntityLoaded');

            this._forwardEvent(mgr, buildRequestEvent(action, ENTITY_REQUEST_STATUS.ERROR), ENTITY_EVENTS.ERROR, (ctx: any) => ({
                action,
                error: ctx?.error,
            }), 'onEntityError');
        }
    },

    /**
     * 通用事件转发方法
     *
     * @param mgr - EntityManager 实例
     * @param sourceEvent - mgr 上的事件名（来自 entity-events.ts 常量）
     * @param targetEvent - 组件事件名（来自 component-events.ts ENTITY_EVENTS 常量）
     * @param buildData - 从 mgr 事件参数构建转发数据的函数
     * @param hookName - 钩子函数名（如 onEntityCreated）
     */
    _forwardEvent(
        mgr: any,
        sourceEvent: string,
        targetEvent: string,
        buildData: (...args: any[]) => any,
        hookName: string,
    ): void {
        const off = mgr.on(sourceEvent, (...args: any[]) => {
            const data = buildData(...args);
            const hookResult = this._callEntityHook(hookName, data);
            if (hookResult === false) return;
            this.emit?.(targetEvent, hookResult || data);
        });
        if (typeof off === 'function') this.onCleanup(off);
    },

    // ============================================
    // 钩子调用
    // ============================================

    /**
     * 调用实体事件钩子
     *
     * @param hookName - 钩子函数名（如 onEntityCreated）
     * @param data - 事件数据
     * @returns 钩子返回值：false 阻止转发，对象替换数据，undefined 正常转发
     */
    _callEntityHook(hookName: string, data: any): any {
        const hook = this[hookName];
        if (typeof hook !== 'function') return undefined;
        return hook.call(this, data);
    },
};
