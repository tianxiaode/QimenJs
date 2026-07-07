/**
 * EntityEventAbility 实体事件能力（已废弃）
 *
 * @deprecated 请使用 EntityEmitAbility 替代。
 * EntityEmitAbility 增加了分页信息、树事件转发，并使用事件常量替代硬编码。
 *
 * 此文件仅保留向后兼容，不再更新。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_REQUEST_STATUS,
    buildRequestEvent,
} from '@qimenjs/events';
import { ENTITY_EVENTS } from '@qimenjs/events';

export const EntityEventAbility: AbilityDefinition = {
    // ============================================
    // 初始化
    // ============================================

    /**
     * 初始化实体事件
     */
    __init__: '_initEntityEvent',

    _initEntityEvent(): void {
        // 注册事件源 + 转发 EntityManager 事件
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

    /**
     * 转发 EntityManager 事件为组件事件
     *
     * EntityManager 事件 → 组件事件（entity:* 前缀）
     * 组件 dispose 时通过 onCleanup 自动解绑
     *
     * 事件分类：
     * - 数据变更：dataChange → entity:datachange
     * - CRUD 结果：created/updated/deleted/saved/toggled → entity:created 等
     * - 列表加载：listed/got → entity:listed / entity:got
     * - 请求状态：{action}:loading/success/error → entity:loading/loaded/error
     *
     * 每个事件转发前会调用对应的钩子函数 onEntity{EventName}，
     * 钩子可以修改数据、阻止转发或执行额外逻辑。
     */
    _forwardEntityEvents(): void {
        const mgr = this.mgr;
        if (!mgr || typeof mgr.on !== 'function') return;

        // ---- 数据变更事件 ----
        const offDataChange = mgr.on(ENTITY_DATA_EVENTS.DATA_CHANGE, () => {
            const data = { source: this.id };
            const hookResult = this._callEntityHook('onEntityDataChange', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.DATA_CHANGE, hookResult || data);
        });
        if (typeof offDataChange === 'function') this.onCleanup(offDataChange);

        // ---- CRUD 结果事件 ----
        const offCreated = mgr.on(ENTITY_CRUD_EVENTS.CREATED, (item: any) => {
            const data = { item };
            const hookResult = this._callEntityHook('onEntityCreated', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.CREATED, hookResult || data);
        });
        if (typeof offCreated === 'function') this.onCleanup(offCreated);

        const offUpdated = mgr.on(ENTITY_CRUD_EVENTS.UPDATED, (item: any) => {
            const data = { item };
            const hookResult = this._callEntityHook('onEntityUpdated', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.UPDATED, hookResult || data);
        });
        if (typeof offUpdated === 'function') this.onCleanup(offUpdated);

        const offDeleted = mgr.on(ENTITY_CRUD_EVENTS.DELETED, (ids: any) => {
            const data = { ids };
            const hookResult = this._callEntityHook('onEntityDeleted', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.DELETED, hookResult || data);
        });
        if (typeof offDeleted === 'function') this.onCleanup(offDeleted);

        const offSaved = mgr.on(ENTITY_CRUD_EVENTS.SAVED, () => {
            const data = {};
            const hookResult = this._callEntityHook('onEntitySaved', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.SAVED, hookResult || data);
        });
        if (typeof offSaved === 'function') this.onCleanup(offSaved);

        const offToggled = mgr.on(ENTITY_CRUD_EVENTS.TOGGLED, (rawData: any) => {
            const hookResult = this._callEntityHook('onEntityToggled', rawData);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.TOGGLED, hookResult || rawData);
        });
        if (typeof offToggled === 'function') this.onCleanup(offToggled);

        // ---- 列表加载事件 ----
        const offListed = mgr.on(ENTITY_LIST_EVENTS.LISTED, (items: any) => {
            const data = { items };
            const hookResult = this._callEntityHook('onEntityListed', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.LISTED, hookResult || data);
        });
        if (typeof offListed === 'function') this.onCleanup(offListed);

        const offGot = mgr.on(ENTITY_LIST_EVENTS.GOT, (item: any) => {
            const data = { item };
            const hookResult = this._callEntityHook('onEntityGot', data);
            if (hookResult === false) return;
            this.emit?.(ENTITY_EVENTS.GOT, hookResult || data);
        });
        if (typeof offGot === 'function') this.onCleanup(offGot);

        // ---- 请求状态事件 ----
        // 转发所有 action 的 loading/success/error 事件
        const requestActions = ['list', 'create', 'update', 'delete', 'toggle', 'batch-delete', 'batch-save'];
        for (const action of requestActions) {
            const offLoading = mgr.on(buildRequestEvent(action, ENTITY_REQUEST_STATUS.LOADING), (loading: boolean) => {
                const data = { action, loading };
                const hookResult = this._callEntityHook('onEntityLoading', data);
                if (hookResult === false) return;
                this.emit?.(ENTITY_EVENTS.LOADING, hookResult || data);
            });
            if (typeof offLoading === 'function') this.onCleanup(offLoading);

            const offSuccess = mgr.on(buildRequestEvent(action, ENTITY_REQUEST_STATUS.SUCCESS), (ctx: any) => {
                const data = { action, data: ctx?.data };
                const hookResult = this._callEntityHook('onEntityLoaded', data);
                if (hookResult === false) return;
                this.emit?.(ENTITY_EVENTS.LOADED, hookResult || data);
            });
            if (typeof offSuccess === 'function') this.onCleanup(offSuccess);

            const offError = mgr.on(buildRequestEvent(action, ENTITY_REQUEST_STATUS.ERROR), (ctx: any) => {
                const data = { action, error: ctx?.error };
                const hookResult = this._callEntityHook('onEntityError', data);
                if (hookResult === false) return;
                this.emit?.(ENTITY_EVENTS.ERROR, hookResult || data);
            });
            if (typeof offError === 'function') this.onCleanup(offError);
        }
    },

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
