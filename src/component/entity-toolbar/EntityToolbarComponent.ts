/**
 * EntityToolbarComponent 实体工具栏组件
 *
 * 继承 ToolbarComponent，为实体操作提供工具栏界面。
 * 完整功能内聚于此组件（不拆独立能力），其他需要工具栏的场景直接用本组件即可。
 *
 * 两种 items 配置方式（可混用）：
 *   1. 声明式（推荐）：传 props.pagination + props.crud 对象，
 *      onAfterInit 中自动调用工厂函数生成 items。
 *   2. 工厂函数展开：`items: [...createPaginationItems({...}), ...createCrudItems({...})]`
 *
 * 能力（类级 use() 一次）：
 *   - DomainAbility：this.domainConfig 访问域配置（pageSize / pagesizes）
 *   - EntityEventBusAbility（系统自动挂载）：this.entityOn 订阅实体事件
 *
 * 实体事件监听（有 entityKey 时自动启用）：
 *   - list:loading（true/false）→ 加载中禁用 CRUD + 翻页按钮，加载完恢复
 *   - list:success（RequestContext）→ 从 ctx.data.total 提取总数，更新 totalRecords/totalPages
 *   - listed（items）→ 列表已刷新（可用于触发外部刷新，此处仅刷新分页显示）
 *
 * @example
 * ```ts
 * const toolbar = new EntityToolbarComponent({
 *     domain: 'api',
 *     entityKey: 'users',
 *     pagination: { firstPage: true, prevPage: true, pageNum: true, pageTotal: true,
 *                   nextPage: true, lastPage: true, pageSize: true, totalRecords: true },
 *     crud: { create: true, edit: true, delete: true, refresh: true, save: true },
 * });
 *
 * // 实体列表加载完成会自动通过 list:success 事件同步 totalRecords/totalPages。
 * // 也可手动同步：
 * toolbar.update({ page: 2, totalPages: 10, totalRecords: 95 });
 * toolbar.setItemStates({ edit: false, delete: false, save: true });
 * ```
 */

import { ToolbarComponent } from '../toolbar/ToolbarComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { CRUD_EVENTS, PAGINATION_EVENTS } from '../../events/component-events';
import { DomainAbility } from '../../system-abilities/system/DomainAbility';
import { PAGINATION_ITEM_NAMES, createPaginationItems } from './pagination-items';
import { CRUD_ITEM_NAMES, createCrudItems } from './crud-items';
import type { EntityToolbarItemDef, EntityToolbarState, EntityToolbarItemState } from './types';
import './entitytoolbar.css';

// ══════════════════════════════════════════════════════════════
// 常量（兜底默认值，与 DomainPagingAbility 对齐）
// ══════════════════════════════════════════════════════════════

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

// ══════════════════════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════════════════════

export type { EntityToolbarItemDef, EntityToolbarState, EntityToolbarItemState } from './types';

// ══════════════════════════════════════════════════════════════
// EntityToolbarComponent
// ══════════════════════════════════════════════════════════════

class EntityToolbarComponent extends ToolbarComponent {
    _domain: string = '';
    _currentPage: number = 1;
    _totalPages: number = 0;
    _totalRecords: number = 0;
    _loading: boolean = false;

    /**
     * domEvents — 委托 Button 点击，按 action 转发实体事件
     *
     * 'Button' 路径：按 Button 类型在 _items 中定位点击的子项
     * entities: '[action]' → 用 item.action 作为事件名，entityEmit 到 entityKey 对应实体
     *            （create/edit/delete/refresh/save/import/export/firstPage/prevPage/nextPage/lastPage）
     * handler: '_onButtonClick' → 本地分页状态更新 + emit 组件级事件（PAGINATION_EVENTS/CRUD_EVENTS）
     *
     * 参考 AccordionComponent 的 domEvents 委托模式。
     */
    domEvents?: DomEventsMap | undefined = {
        click: {
            Button: {
                handler: '_onButtonClick',
                entities: '[action]',
            },
        },
    };

    /**
     * listens — 声明式订阅实体事件，刷新分页状态与按钮状态
     *
     * entity: true 仅作类型标识，entityKey 统一取 instance.entityKey
     * （构造函数已赋值，bindListens 在 FINALIZE 阶段执行时已就绪）。
     * - list:loading（true/false）→ 加载中禁用按钮
     * - list:success（RequestContext）→ 提取 total 更新 totalRecords/totalPages
     * - listed（items）→ 刷新分页显示
     */
    listens = [
        {
            entity: true,
            events: {
                'list:loading': '_onListLoading',
                'list:success': '_onListSuccess',
                listed: '_onListed',
            },
        },
    ];

    onAfterInit(props?: Record<string, any>): void {
        const self = this as any;
        self.addCls('q-entity-toolbar');
        if (self.itemContainer) self.itemContainer.addCls('q-entity-toolbar__items');

        if (props?.domain) self._domain = props.domain;

        // 调 super 前把 pagination/crud + items 合并 → 父类只 setItems 一次
        const mergedItems = this._resolveMergedItems(props);

        super.onAfterInit({
            direction: 'horizontal',
            defaultItemType: 'Button',
            gap: '4px',
            ...props,
            items: mergedItems.length > 0 ? mergedItems : undefined,
        } as any);

        this._initEntityToolbar(props);
    }

    /**
     * 合并声明式 pagination / crud 展开项与 props.items 自定义项。
     * 顺序：pagination（order 100-170）→ 自定义 items → crud（order 200-260）。
     * 最终位置由各 item 的 order 字段经 CSS flex order 决定。
     */
    _resolveMergedItems(props?: EntityToolbarProps): Record<string, any>[] {
        const self = this as any;
        const merged: Record<string, any>[] = [];

        merged.push(
            ...createPaginationItems(props?.pagination, {
                defaultPageSize: self.pageSize,
                pageSizes: self.pageSizes,
            })
        );

        if (props?.items && props.items.length > 0) merged.push(...props.items);

        merged.push(...createCrudItems(props?.crud));

        return merged;
    }

    _initEntityToolbar(props?: EntityToolbarProps): void {
        const self = this as any;
        self._setupFormEvents();
        self._syncPageBtnStates();
    }

    // ══════════════════════════════════════════════════════════════
    // domain / pageSize / pageSizes（domainConfig 兜底，首次读时固化）
    // ══════════════════════════════════════════════════════════════

    get domain(): string {
        return (this as any)._domain;
    }
    set domain(v: string) {
        (this as any)._domain = v ?? '';
    }

    /**
     * 每页条数：优先 domainConfig.pageSize，兜底 20。首次读时固化到实例。
     */
    get pageSize(): number {
        const config = (this as any).domainConfig;
        const value = config?.pageSize ?? DEFAULT_PAGE_SIZE;
        Object.defineProperty(this, 'pageSize', {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        return value;
    }
    set pageSize(v: number) {
        Object.defineProperty(this, 'pageSize', {
            value: v,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        const item = (this as any)._findItemByName?.('pageSize');
        if (item && typeof item.setValue === 'function') item.setValue(v);
    }

    /**
     * 可选每页条数列表：优先 domainConfig.pagesizes，兜底 [10,20,50,100]。
     */
    get pageSizes(): number[] {
        const config = (this as any).domainConfig;
        const value = config?.pagesizes ?? DEFAULT_PAGE_SIZES;
        Object.defineProperty(this, 'pageSizes', {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        return value;
    }
    set pageSizes(v: number[]) {
        Object.defineProperty(this, 'pageSizes', {
            value: v,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        const item = (this as any)._findItemByName?.('pageSize');
        if (item && typeof item.setOptions === 'function') {
            item.setOptions(v.map(s => ({ label: String(s), value: s })));
        }
    }

    // ══════════════════════════════════════════════════════════════
    // 实体事件处理（listens 声明式订阅，handler 由 ListensEngine 调用）
    // ══════════════════════════════════════════════════════════════

    /** list:loading（true/false）→ 加载中禁用按钮，加载完恢复 */
    _onListLoading(loading: any): void {
        const self = this as any;
        self._loading = !!loading;
        self._syncLoadingBtnStates();
    }

    /** list:success（RequestContext）→ 提取 total 更新 totalRecords/totalPages */
    _onListSuccess(ctx: any): void {
        const self = this as any;
        const total = ctx?.data?.total ?? ctx?.total;
        if (typeof total === 'number') {
            self._totalRecords = total;
            const size = self.pageSize || DEFAULT_PAGE_SIZE;
            self._totalPages = Math.ceil(total / size) || 0;
            self._updatePageDisplay();
            self._updateTotalRecordsDisplay();
            self._syncPageBtnStates();
        }
    }

    /** listed（items）→ 列表刷新，同步分页显示（currentPage 已由翻页交互维护） */
    _onListed(): void {
        const self = this as any;
        self._updatePageDisplay();
        self._updateTotalRecordsDisplay();
        self._syncPageBtnStates();
    }

    /**
     * 加载中禁用所有 CRUD + 翻页按钮，加载完恢复（按当前分页状态决定首末翻页）。
     */
    _syncLoadingBtnStates(): void {
        const self = this as any;
        const loading = !!self._loading;
        const names = [...Array.from(PAGINATION_ITEM_NAMES), ...Array.from(CRUD_ITEM_NAMES)];
        for (const name of names) {
            const item = self._findItemByName(name);
            if (item) item.disabled = loading;
        }
        if (!loading) self._syncPageBtnStates();
    }

    // ══════════════════════════════════════════════════════════════
    // 按钮点击（domEvents click → Button 委托）
    // ══════════════════════════════════════════════════════════════

    /**
     * Button 点击 handler（domEvents 委托触发）。
     * entities: '[action]' 已自动把 action 转发为实体事件（entityEmit），
     * 这里只负责本地分页状态更新 + emit 组件级事件供外部消费者监听。
     */
    _onButtonClick(domEvt: any): void {
        const self = this as any;
        const item = self.getTargetItem?.(domEvt?.target);
        if (!item) return;

        const action = item.component?.action;
        if (!action) return;

        if (PAGINATION_ITEM_NAMES.has(action)) {
            // 翻页按钮：本地 currentPage 更新
            if (action === 'firstPage') self.currentPage = 1;
            else if (action === 'prevPage') self.currentPage = Math.max(1, self._currentPage - 1);
            else if (action === 'nextPage') {
                self.currentPage = self._totalPages
                    ? Math.min(self._totalPages, self._currentPage + 1)
                    : self._currentPage + 1;
            } else if (action === 'lastPage')
                self.currentPage = self._totalPages || self._currentPage;

            self.emit(PAGINATION_EVENTS.CHANGE, { action, page: self._currentPage });
        } else if (CRUD_ITEM_NAMES.has(action)) {
            self.emit(CRUD_EVENTS.ACTION, { action });
        }
    }

    // ══════════════════════════════════════════════════════════════
    // 表单事件（pageNum 输入 / pageSize 选择）
    // ══════════════════════════════════════════════════════════════

    _setupFormEvents(): void {
        const self = this as any;

        self.on('pageNumInputChange', (data: any) => {
            const page = parseInt(data?.formValue, 10);
            if (!isNaN(page) && page >= 1) self.currentPage = page;
        });

        self.on('pageSizeSelectChange', (data: any) => {
            self.pageSize = data?.formValue;
            self.emit(PAGINATION_EVENTS.CHANGE, {
                action: 'pageSizeChange',
                pageSize: data?.formValue,
            });
        });
    }

    // ══════════════════════════════════════════════════════════════
    // 分页状态
    // ══════════════════════════════════════════════════════════════

    get currentPage(): number {
        return (this as any)._currentPage;
    }
    set currentPage(v: number) {
        const self = this as any;
        self._currentPage = v;
        self._updatePageDisplay();
        self._syncPageBtnStates();
    }

    get totalPages(): number {
        return (this as any)._totalPages;
    }
    set totalPages(v: number) {
        const self = this as any;
        self._totalPages = v;
        self._updatePageDisplay();
        self._syncPageBtnStates();
    }

    get totalRecords(): number {
        return (this as any)._totalRecords;
    }
    set totalRecords(v: number) {
        const self = this as any;
        self._totalRecords = v;
        self._updateTotalRecordsDisplay();
    }

    get loading(): boolean {
        return (this as any)._loading;
    }

    /**
     * 批量同步状态：{ page, totalPages, totalRecords, pageSize }。
     * 刷新显示 + 按钮状态。不触发重渲染，仅同步分页状态。
     */
    syncState(state: EntityToolbarState): void {
        const self = this as any;
        if (state?.page !== undefined) self._currentPage = state.page;
        if (state?.totalPages !== undefined) self._totalPages = state.totalPages;
        if (state?.totalRecords !== undefined) self._totalRecords = state.totalRecords;
        if (state?.pageSize !== undefined) self.pageSize = state.pageSize;
        self._updatePageDisplay();
        self._updateTotalRecordsDisplay();
        self._syncPageBtnStates();
    }

    _updatePageDisplay(): void {
        const self = this as any;
        const pageNumItem = self._findItemByName('pageNum');
        if (pageNumItem) pageNumItem.numValue = self._currentPage;
        const pageTotalItem = self._findItemByName('pageTotal');
        if (pageTotalItem) pageTotalItem.text = `${self._currentPage}/${self._totalPages}`;
    }

    _updateTotalRecordsDisplay(): void {
        const self = this as any;
        const totalItem = self._findItemByName('totalRecords');
        if (totalItem) totalItem.text = `${self._totalRecords}`;
    }

    /**
     * 根据当前页/总页禁用首尾翻页按钮。
     */
    _syncPageBtnStates(): void {
        const self = this as any;
        if (self._loading) return; // 加载中已全部禁用
        const cur = self._currentPage ?? 1;
        const total = self._totalPages ?? 0;

        const atFirst = cur <= 1;
        const atLast = total > 0 && cur >= total;

        const first = self._findItemByName('firstPage');
        const prev = self._findItemByName('prevPage');
        const next = self._findItemByName('nextPage');
        const last = self._findItemByName('lastPage');

        first && (first.disabled = atFirst);
        prev && (prev.disabled = atFirst);
        next && (next.disabled = atLast);
        last && (last.disabled = atLast);
    }

    _findItemByName(name: string): any {
        const self = this as any;
        for (const item of self._items) {
            if (item.component?.name === name) return item.component;
        }
        return null;
    }

    // ══════════════════════════════════════════════════════════════
    // 按钮状态便捷方法
    // ══════════════════════════════════════════════════════════════

    /**
     * 批量更新多个按钮状态（enable/hidden/cls/iconCls）。
     * @example
     * toolbar.updateItemStates({ edit:{enabled:false}, delete:{hidden:true}, save:{cls:'s'} });
     */
    updateItemStates(states: Record<string, EntityToolbarItemState>): void {
        const self = this as any;
        for (const [name, s] of Object.entries(states ?? {})) {
            const item = self._findItemByName(name);
            if (!item) continue;
            if (s.enabled !== undefined) item.disabled = !s.enabled;
            if (s.hidden !== undefined) item.hidden = s.hidden;
            if (s.cls !== undefined) typeof item.addCls === 'function' && item.addCls(s.cls);
            if (s.iconCls !== undefined) item.icon = s.iconCls;
        }
    }

    /**
     * 批量设置按钮 enable 状态。
     * @example toolbar.setItemStates({ edit:false, delete:false, save:true });
     */
    setItemStates(map: Record<string, boolean>): void {
        const self = this as any;
        for (const [name, enabled] of Object.entries(map ?? {})) {
            const item = self._findItemByName(name);
            if (item) item.disabled = !enabled;
        }
    }

    setItemEnabled(name: string, enabled: boolean): void {
        const item = (this as any)._findItemByName(name);
        if (item) item.disabled = !enabled;
    }

    setItemHidden(name: string, hidden: boolean): void {
        const item = (this as any)._findItemByName(name);
        if (item) item.hidden = hidden;
    }

    setItemCls(name: string, cls: string): void {
        const item = (this as any)._findItemByName(name);
        if (item && typeof item.addCls === 'function') item.addCls(cls);
    }

    setItemIconCls(name: string, iconCls: string): void {
        const item = (this as any)._findItemByName(name);
        if (item) item.icon = iconCls;
    }

    getSearchValue(): string {
        const searchItem = (this as any)._findItemByName('search');
        return searchItem?.value ?? '';
    }

    /** 批量设置分页信息并刷新显示（syncState 的便捷别名） */
    setPageInfo(page: number, totalPages: number, totalRecords: number): void {
        this.syncState({ page, totalPages, totalRecords });
    }

    // ══════════════════════════════════════════════════════════════
    // 组件 update（props 变更，重写基类）
    // ══════════════════════════════════════════════════════════════

    update(props?: Record<string, any>): void {
        const self = this as any;
        super.update(props);

        if (
            props?.pagination !== undefined ||
            props?.crud !== undefined ||
            props?.items !== undefined
        ) {
            const merged = this._resolveMergedItems({
                ...(self._lastProps || {}),
                ...(props || {}),
            } as EntityToolbarProps);
            self.clear();
            if (merged.length > 0) self.setItems(merged);
        }
        if (props?.domain !== undefined) self._domain = props.domain;
        if (props?.entityKey !== undefined) self.entityKey = props.entityKey;
        self._lastProps = { ...(self._lastProps || {}), ...(props || {}) };
    }
}

// 类级 use() 一次：DomainAbility 提供 this.domainConfig
// EntityEventBusAbility 由系统自动挂载（COMPONENT_ABILITIES），无需 use
EntityToolbarComponent.use([DomainAbility]);

export { EntityToolbarComponent };
export type EntityToolbarComponentInstance = InstanceType<typeof EntityToolbarComponent>;
