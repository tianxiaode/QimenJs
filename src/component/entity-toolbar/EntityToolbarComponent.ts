import { ToolbarComponent } from '../toolbar/ToolbarComponent';
import type { ToolbarProps } from '../toolbar/ToolbarComponent';
import { CRUD_EVENTS, PAGINATION_EVENTS } from '../../events/component-events';
import { DomainAbility } from '../../system-abilities/system/DomainAbility';
import { ENTITY_TOOLBAR_TPL } from './entity-toolbar-tpl';

// ══════════════════════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════════════════════

export interface EntityToolbarItemDef {
    type?: string;
    name?: string;
    order?: number;
    cls?: string;
    iconCls?: string;
    text?: string;
    variant?: string;
    [key: string]: any;
}

export type EntityToolbarItems = Record<string, boolean | EntityToolbarItemDef>;

export interface EntityToolbarProps extends Omit<ToolbarProps, 'items'> {
    items?: EntityToolbarItems;
    entityKey?: string;
    eventKey?: string;
}

// ══════════════════════════════════════════════════════════════
// 内置 item 定义
// ══════════════════════════════════════════════════════════════

interface BuiltinItemDef {
    name: string;
    type: string;
    order: number;
    iconCls: string;
    text: string;
    variant: string;
}

const BUILTIN_DEFS: Record<string, BuiltinItemDef> = {
    firstPage: {
        name: 'firstPage',
        type: 'Button',
        order: 100,
        iconCls: 'q-toolbar-btn-first-page',
        text: 'i18n:toolbar.firstPage',
        variant: 'default',
    },
    prevPage: {
        name: 'prevPage',
        type: 'Button',
        order: 110,
        iconCls: 'q-toolbar-btn-prev-page',
        text: 'i18n:toolbar.prevPage',
        variant: 'default',
    },
    pageNum: {
        name: 'pageNum',
        type: 'NumberInput',
        order: 120,
        iconCls: '',
        text: '',
        variant: '',
    },
    pageTotal: {
        name: 'pageTotal',
        type: 'Text',
        order: 130,
        iconCls: '',
        text: '1/0',
        variant: '',
    },
    nextPage: {
        name: 'nextPage',
        type: 'Button',
        order: 140,
        iconCls: 'q-toolbar-btn-next-page',
        text: 'i18n:toolbar.nextPage',
        variant: 'default',
    },
    lastPage: {
        name: 'lastPage',
        type: 'Button',
        order: 150,
        iconCls: 'q-toolbar-btn-last-page',
        text: 'i18n:toolbar.lastPage',
        variant: 'default',
    },
    pageSize: { name: 'pageSize', type: 'Select', order: 160, iconCls: '', text: '', variant: '' },
    totalRecords: {
        name: 'totalRecords',
        type: 'Text',
        order: 170,
        iconCls: '',
        text: '0',
        variant: '',
    },
    search: {
        name: 'search',
        type: 'Input',
        order: 180,
        iconCls: 'q-toolbar-btn-search',
        text: 'i18n:toolbar.search',
        variant: '',
    },
    create: {
        name: 'create',
        type: 'Button',
        order: 200,
        iconCls: 'q-toolbar-btn-create',
        text: 'i18n:toolbar.create',
        variant: 'primary',
    },
    edit: {
        name: 'edit',
        type: 'Button',
        order: 210,
        iconCls: 'q-toolbar-btn-edit',
        text: 'i18n:toolbar.edit',
        variant: 'default',
    },
    delete: {
        name: 'delete',
        type: 'Button',
        order: 220,
        iconCls: 'q-toolbar-btn-delete',
        text: 'i18n:toolbar.delete',
        variant: 'warning',
    },
    refresh: {
        name: 'refresh',
        type: 'Button',
        order: 230,
        iconCls: 'q-toolbar-btn-refresh',
        text: 'i18n:toolbar.refresh',
        variant: 'default',
    },
    save: {
        name: 'save',
        type: 'Button',
        order: 240,
        iconCls: 'q-toolbar-btn-save',
        text: 'i18n:toolbar.save',
        variant: 'primary',
    },
    import: {
        name: 'import',
        type: 'Button',
        order: 250,
        iconCls: 'q-toolbar-btn-import',
        text: 'i18n:toolbar.import',
        variant: 'default',
    },
    export: {
        name: 'export',
        type: 'Button',
        order: 260,
        iconCls: 'q-toolbar-btn-export',
        text: 'i18n:toolbar.export',
        variant: 'default',
    },
    upload: {
        name: 'upload',
        type: 'Button',
        order: 270,
        iconCls: 'q-toolbar-btn-upload',
        text: 'i18n:toolbar.upload',
        variant: 'default',
    },
    download: {
        name: 'download',
        type: 'Button',
        order: 280,
        iconCls: 'q-toolbar-btn-download',
        text: 'i18n:toolbar.download',
        variant: 'default',
    },
    history: {
        name: 'history',
        type: 'Button',
        order: 290,
        iconCls: 'q-toolbar-btn-history',
        text: 'i18n:toolbar.history',
        variant: 'default',
    },
    help: {
        name: 'help',
        type: 'Button',
        order: 300,
        iconCls: 'q-toolbar-btn-help',
        text: 'i18n:toolbar.help',
        variant: 'default',
    },
};

const PAGINATION_ACTION_NAMES = new Set(['firstPage', 'prevPage', 'nextPage', 'lastPage']);
const CRUD_ACTION_NAMES = new Set([
    'create',
    'edit',
    'delete',
    'refresh',
    'save',
    'import',
    'export',
]);

// ══════════════════════════════════════════════════════════════
// EntityToolbarComponent
// ══════════════════════════════════════════════════════════════

class EntityToolbarComponent extends ToolbarComponent {
    static type = 'EntityToolbar';
    type = 'EntityToolbar' as const;

    onInitState() {
        return {
            ...super.onInitState(),
            _itemsConfig: {} as EntityToolbarItems,
            _entityKey: '' as string,
            _eventKey: '' as string,
            _currentPage: 1 as number,
            _totalPages: 0 as number,
            _totalRecords: 0 as number,
            _pageSize: 10 as number,
        };
    }

    onAfterInit(props?: any): void {
        const self = this as any;
        self.addCls('q-entity-toolbar');
        if (self.itemContainer) self.itemContainer.addCls('q-entity-toolbar__items');
        super.onAfterInit({
            direction: 'horizontal',
            defaultItemType: 'Button',
            gap: '4px',
            ...props,
        } as any);
        this._initEntityToolbar(props);
    }

    _initEntityToolbar(props?: EntityToolbarProps): void {
        const self = this as any;
        self._itemsConfig = props?.items ?? {};
        self._entityKey = props?.entityKey ?? '';
        self._eventKey = props?.eventKey ?? '';

        const resolved = self._resolveItems(self._itemsConfig);
        if (resolved.length > 0) self.setItems(resolved);
        self._setupSemanticEvents();
    }

    // ══════════════════════════════════════════════
    // items 解析
    // ══════════════════════════════════════════════

    _resolveItems(config: EntityToolbarItems): Record<string, any>[] {
        const self = this as any;
        const items: Record<string, any>[] = [];

        for (const [key, val] of Object.entries(config)) {
            if (val === false) continue;

            const builtin = BUILTIN_DEFS[key];
            if (builtin) {
                if (val === true) {
                    items.push(self._buildBuiltinItem(builtin, {}));
                } else {
                    items.push(self._buildBuiltinItem(builtin, val as EntityToolbarItemDef));
                }
            } else {
                items.push(self._buildCustomItem(key, val as EntityToolbarItemDef));
            }
        }

        return items;
    }

    _buildBuiltinItem(def: BuiltinItemDef, override: EntityToolbarItemDef): Record<string, any> {
        const self = this as any;
        const name = override.name ?? def.name;
        const order = override.order ?? def.order;
        const iconCls = override.iconCls ?? def.iconCls;
        const text = override.text ?? def.text;
        const variant = override.variant ?? def.variant;

        if (def.type === 'Button') {
            const variantCls = variant && variant !== 'default' ? ` q-button--${variant}` : '';
            return {
                type: 'Button',
                name,
                icon: iconCls,
                text,
                cls: `q-entity-toolbar__btn q-entity-toolbar__btn--${name}${variantCls}${override.cls ? ' ' + override.cls : ''}`,
                order,
            };
        }

        if (name === 'pageNum') {
            return {
                type: 'NumberInput',
                name: 'pageNum',
                value: 1,
                min: 1,
                cls: 'q-entity-toolbar__input q-entity-toolbar__input--page-num',
                order,
            };
        }
        if (name === 'pageSize') {
            const defaultPageSize = self.domainConfig?.pageSize ?? 10;
            const pageSizes: number[] = self.domainConfig?.pagesizes ?? [10, 20, 50, 100];
            return {
                type: 'Select',
                name: 'pageSize',
                value: defaultPageSize,
                options: pageSizes.map((s: number) => ({ label: String(s), value: s })),
                cls: 'q-entity-toolbar__select q-entity-toolbar__select--page-size',
                order,
            };
        }
        if (name === 'pageTotal') {
            return {
                type: 'Text',
                name: 'pageTotal',
                text: '1/0',
                cls: 'q-entity-toolbar__text q-entity-toolbar__text--page-total',
                order,
            };
        }
        if (name === 'totalRecords') {
            return {
                type: 'Text',
                name: 'totalRecords',
                text: '0',
                cls: 'q-entity-toolbar__text q-entity-toolbar__text--total-records',
                order,
            };
        }
        if (name === 'search') {
            return {
                type: 'Input',
                name: 'search',
                placeholder: 'i18n:toolbar.searchPlaceholder',
                clearable: true,
                cls: 'q-entity-toolbar__input q-entity-toolbar__input--search',
                order,
            };
        }

        return { type: def.type, name, text, order, ...override };
    }

    _buildCustomItem(key: string, def: EntityToolbarItemDef): Record<string, any> {
        const type = def.type ?? 'Button';
        const name = def.name ?? key;
        const order = def.order ?? 150;
        const item: Record<string, any> = { type, name, order, ...def };
        delete item.type;
        item.type = type;
        return item;
    }

    // ══════════════════════════════════════════════
    // 语义事件
    // ══════════════════════════════════════════════

    _setupSemanticEvents(): void {
        const self = this as any;

        self.on('action', (data: any) => {
            const itemName = data?.name ?? data?.item?.name;
            if (!itemName) return;

            if (PAGINATION_ACTION_NAMES.has(itemName)) {
                self.emit(PAGINATION_EVENTS.CHANGE, {
                    action: itemName,
                    page: self._currentPage,
                    ...data,
                });
            }
            if (CRUD_ACTION_NAMES.has(itemName)) {
                self.emit(CRUD_EVENTS.ACTION, { action: itemName, ...data });
            }
        });

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

    // ══════════════════════════════════════════════
    // 分页状态
    // ══════════════════════════════════════════════

    get currentPage(): number {
        return (this as any)._currentPage;
    }
    set currentPage(v: number) {
        const self = this as any;
        self._currentPage = v;
        self._updatePageDisplay();
    }

    get totalPages(): number {
        return (this as any)._totalPages;
    }
    set totalPages(v: number) {
        const self = this as any;
        self._totalPages = v;
        self._updatePageDisplay();
    }

    get totalRecords(): number {
        return (this as any)._totalRecords;
    }
    set totalRecords(v: number) {
        const self = this as any;
        self._totalRecords = v;
        self._updateTotalRecordsDisplay();
    }

    get pageSize(): number {
        return (this as any)._pageSize;
    }
    set pageSize(v: number) {
        (this as any)._pageSize = v;
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

    _findItemByName(name: string): any {
        const self = this as any;
        for (const item of self._items) {
            if (item.component?.name === name) return item.component;
        }
        return null;
    }

    // ══════════════════════════════════════════════
    // 便捷方法
    // ══════════════════════════════════════════════

    setPageInfo(page: number, totalPages: number, totalRecords: number): void {
        const self = this as any;
        self._currentPage = page;
        self._totalPages = totalPages;
        self._totalRecords = totalRecords;
        self._updatePageDisplay();
        self._updateTotalRecordsDisplay();
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

    // ══════════════════════════════════════════════
    // update
    // ══════════════════════════════════════════════

    update(props?: Partial<EntityToolbarProps>): void {
        const self = this as any;
        super.update(props);

        if (props?.items !== undefined) {
            self._itemsConfig = props.items;
            self.clear();
            const resolved = self._resolveItems(props.items);
            if (resolved.length > 0) self.setItems(resolved);
        }
        if (props?.entityKey !== undefined) self._entityKey = props.entityKey;
        if (props?.eventKey !== undefined) self._eventKey = props.eventKey;
    }
}

EntityToolbarComponent.use([DomainAbility]);
EntityToolbarComponent.useTemplate(ENTITY_TOOLBAR_TPL);

export { EntityToolbarComponent };
export type EntityToolbarComponentInstance = InstanceType<typeof EntityToolbarComponent>;
