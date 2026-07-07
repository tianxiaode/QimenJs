/**
 * EntityListenAbility 实体监听能力
 *
 * 监听组件事件（CRUD 操作、分页、搜索等），自动调用 EntityManager 执行操作。
 * 事件流方向：组件 → entity
 *
 * 监听的事件（使用 component-events.ts 常量）：
 * - CRUD_EVENTS.ACTION → mgr.create() / mgr.update() / mgr.delete() / mgr.toggle()
 * - PAGINATION_EVENTS.CHANGE → mgr.loadPage() / mgr.changeSize()
 * - 'searchchange' → mgr.filter() / mgr.searchBy()
 * - 'refresh' → mgr.reload()
 *
 * 钩子函数约定：
 * - `onEntity{Action}(data)` — 操作前的钩子
 * - 返回 false 阻止操作
 * - 返回对象替换操作数据
 * - 无返回值则正常执行
 *
 * 操作完成后自动触发 after 钩子：
 * - `afterEntity{Action}(result)` — 操作完成后的回调
 *
 * 配合 EntityCoreAbility（核心管理）和 EntityEmitAbility（事件转发）使用。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { CRUD_EVENTS, CRUD_ACTIONS, PAGINATION_EVENTS } from '@qimenjs/events';

/**
 * 首字母大写
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * CRUD action 到 mgr 方法名的映射
 */
const CRUD_ACTION_TO_MGR_METHOD: Record<string, string> = {
    [CRUD_ACTIONS.CREATE]: 'create',
    [CRUD_ACTIONS.EDIT]: 'update',
    [CRUD_ACTIONS.DELETE]: 'delete',
    [CRUD_ACTIONS.SAVE]: 'save',
};

export const EntityListenAbility: AbilityDefinition = {
    // ============================================
    // 初始化
    // ============================================

    __init__: '_initEntityListen',

    _initEntityListen(): void {
        if (this.mgr) {
            this._bindCrudListener();
            this._bindPageListener();
            this._bindSearchListener();
            this._bindRefreshListener();
        }
    },

    // ============================================
    // CRUD 事件监听
    // ============================================

    /**
     * 绑定 CRUD 事件监听
     *
     * 监听组件的 crudaction 事件，根据 action 类型调用对应的 mgr 方法。
     * 由 EventBridgeAbility 的 crud 桥接触发。
     */
    _bindCrudListener(): void {
        if (typeof this.on === 'function') {
            const off = this.on(CRUD_EVENTS.ACTION, (e: any) => {
                this._handleCrudAction(e);
            });
            if (typeof off === 'function') this.onCleanup(off);
        }
    },

    /**
     * 处理 CRUD 操作
     */
    _handleCrudAction(e: any): void {
        const action = e?.action;
        if (!action) return;

        const mgrMethod = CRUD_ACTION_TO_MGR_METHOD[action];
        if (!mgrMethod || typeof this.mgr?.[mgrMethod] !== 'function') return;

        // 调用 onEntity{Action} 钩子
        const hookName = `onEntity${capitalize(action)}`;
        const hookResult = this._callEntityHook(hookName, e);
        if (hookResult === false) return;

        // 使用钩子返回的数据（如果有）或原始事件数据
        const eventData = hookResult && typeof hookResult === 'object' ? hookResult : e;

        let mgrResult: any;
        switch (action) {
            case CRUD_ACTIONS.CREATE:
                mgrResult = this.mgr.create(eventData?.data);
                break;
            case CRUD_ACTIONS.EDIT:
                mgrResult = this.mgr.update(eventData?.data || eventData?.item);
                break;
            case CRUD_ACTIONS.DELETE:
                mgrResult = this.mgr.delete(eventData?.id || eventData?.ids);
                break;
            case CRUD_ACTIONS.SAVE:
                mgrResult = this.mgr.save?.(eventData?.data);
                break;
        }

        // 调用 afterEntity{Action} 钩子
        const afterHookName = `afterEntity${capitalize(action)}`;
        this._callEntityHook(afterHookName, mgrResult);
    },

    // ============================================
    // 分页事件监听
    // ============================================

    /**
     * 绑定分页事件监听
     *
     * 监听组件的 pagechange 事件，调用 mgr 的分页方法。
     * 由 EventBridgeAbility 的 pagination 桥接触发。
     */
    _bindPageListener(): void {
        if (typeof this.on === 'function') {
            const off = this.on(PAGINATION_EVENTS.CHANGE, (e: any) => {
                this._handlePageChange(e);
            });
            if (typeof off === 'function') this.onCleanup(off);
        }
    },

    /**
     * 处理分页变更
     */
    _handlePageChange(e: any): void {
        if (!this.mgr) return;

        const hookResult = this._callEntityHook('onEntityPageChange', e);
        if (hookResult === false) return;

        const eventData = hookResult && typeof hookResult === 'object' ? hookResult : e;

        if (eventData?.pageSize && typeof this.mgr.changeSize === 'function' && eventData.pageSize !== this.mgr.pageSize) {
            this.mgr.changeSize(eventData.pageSize);
        } else if (eventData?.page && typeof this.mgr.loadPage === 'function') {
            this.mgr.loadPage(eventData.page, eventData.pageSize);
        } else if (eventData?.page && typeof this.mgr.jump === 'function') {
            this.mgr.jump(eventData.page);
        }

        this._callEntityHook('afterEntityPageChange', eventData);
    },

    // ============================================
    // 搜索事件监听
    // ============================================

    /**
     * 绑定搜索事件监听
     */
    _bindSearchListener(): void {
        if (typeof this.on === 'function') {
            const off = this.on('searchchange', (e: any) => {
                this._handleSearchChange(e);
            });
            if (typeof off === 'function') this.onCleanup(off);
        }
    },

    /**
     * 处理搜索变更
     */
    _handleSearchChange(e: any): void {
        if (!this.mgr) return;

        const hookResult = this._callEntityHook('onEntitySearch', e);
        if (hookResult === false) return;

        const eventData = hookResult && typeof hookResult === 'object' ? hookResult : e;

        if (eventData?.keyword !== undefined && typeof this.mgr.filter === 'function') {
            this.mgr.filter(eventData.keyword);
        } else if (eventData?.search && typeof this.mgr.searchBy === 'function') {
            this.mgr.searchBy(eventData.search);
        }

        this._callEntityHook('afterEntitySearch', eventData);
    },

    // ============================================
    // 刷新事件监听
    // ============================================

    /**
     * 绑定刷新事件监听
     */
    _bindRefreshListener(): void {
        if (typeof this.on === 'function') {
            const off = this.on('refresh', (e: any) => {
                this._handleRefresh(e);
            });
            if (typeof off === 'function') this.onCleanup(off);
        }
    },

    /**
     * 处理刷新
     */
    _handleRefresh(e: any): void {
        if (!this.mgr) return;

        const hookResult = this._callEntityHook('onEntityRefresh', e);
        if (hookResult === false) return;

        if (typeof this.mgr.reload === 'function') {
            this.mgr.reload();
        } else if (typeof this.mgr.list === 'function') {
            this.mgr.list();
        }

        this._callEntityHook('afterEntityRefresh', e);
    },

    // ============================================
    // 钩子调用
    // ============================================

    /**
     * 调用实体事件钩子
     *
     * @param hookName - 钩子函数名（如 onEntityCreated）
     * @param data - 事件数据
     * @returns 钩子返回值：false 阻止操作，对象替换数据，undefined 正常执行
     */
    _callEntityHook(hookName: string, data: any): any {
        const hook = this[hookName];
        if (typeof hook !== 'function') return undefined;
        return hook.call(this, data);
    },
};
