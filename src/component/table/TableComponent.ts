import type { ListenItem, TemplateDecl } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '@qimenjs/component';
import { ColumnMetaManager } from './engine/ColumnMetaManager';
import { TableHeaderComponent } from './header/TableHeaderComponent';
import type { ColumnDefOrGroup, ColumnMeta } from './column-types';
import { GROUP_SUMMARY_ROW_TYPE } from './constants';
import { ENTITY_COMMAND_EVENTS, ENTITY_LIFECYCLE_EVENTS } from '@/events';
import { DICTIONARY_MANAGER_ENTITY_TYPE } from '@/entity/types';
import { Definitions } from '@/composable';

class TableComponent extends ItemGroupPooledComponent {
    static type = 'table';
    defaultItemType = 'table-row';
    _isAfterInit = false;
    _columnMetaManager: ColumnMetaManager | null = null;
    _header: TableHeaderComponent | null = null;
    _entityItems: Record<string, any>[] = [];
    _sourceData: Record<string, any>[] = [];

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table',
            children: [
                { tag: 'div', name: 'headerArea', classes: 'q-table__header-area' },
                { tag: 'div', name: 'itemContainer', classes: 'q-table__body' },
            ],
        };
    }

    get defaultOptions(): Record<string, any> {
        return {
            direction: 'vertical',
            autoEventKey: true,
            autoEntityKey: true,
        };
    }

    listens: ListenItem[] = [
        {
            source: 'self',
            events: {
                sortChange: 'onSortChange',
                resize: 'onColumnResize',
                groupBy: 'onGroupBy',
            },
        },
        {
            entity: true,
            events: {
                listed: 'onEntityListed',
            },
        },
    ];

    onAfterInit(): void {
        super.onAfterInit();

        const source = this.getData('data');
        if (Array.isArray(source)) this._sourceData = source;

        this._connectEntity();

        const headerArea = this.getNodeEl('headerArea');
        if (headerArea) {
            const columns = this.getData('columns') || [];
            this._header = new TableHeaderComponent({
                columns,
                eventKey: this.eventKey,
                entityKey: this.entityKey,
            });
            headerArea.appendChild(this._header.el);
        }

        this._isAfterInit = true;
        this._reflow();
    }

    /**
     * 对接实体：全部通过实体事件流程，组件不直接引用任何实体类。
     * - 有 entityKey（自定义或 autoEntityKey 自动生成）：发送 CONNECT 让
     *   DataDispatchCenter 按 entityType 注册表创建实例，订阅 listed 事件
     *   获取数据，发送 LIST 命令触发加载。
     */
    _connectEntity(): void {
        const entityKey = this.getData('entityKey');
        if (!entityKey) return;

        this.entityEmit(ENTITY_LIFECYCLE_EVENTS.CONNECT, {
            entityKey,
            entityType: this.getData('entityType') || DICTIONARY_MANAGER_ENTITY_TYPE,
        });

        this.entityEmit(ENTITY_COMMAND_EVENTS.LIST, null, { source: entityKey });

        const data = this.getData('data');
        if (Array.isArray(data) && data.length > 0) {
            this.entityEmit(ENTITY_COMMAND_EVENTS.LOAD_DICTIONARY, data, { source: entityKey });
        }
    }

    onEntityListed(items: any[]): void {
        this._entityItems = Array.isArray(items) ? items : [];
        if (this._isAfterInit) this._reflow();
    }

    _onSortChange(data: any): void {
        const colName = data.colName;
        const direction = data.direction;
        const entityKey = this.getData('entityKey');
        if (!entityKey) return;
        this.entityEmit(
            ENTITY_COMMAND_EVENTS.SORT,
            { sortBy: colName, sortOrder: direction ?? '' },
            { source: entityKey }
        );
    }

    _onColumnResize(data: any): void {
        const colName = data.colName;
        const width = data.width;
        this.el!.style.setProperty(`--q-table-col-${colName}-width`, `${width}px`);
        if (this._columnMetaManager) {
            const meta = this._columnMetaManager.get(colName);
            if (meta) meta.width = `${width}px`;
        }
    }

    onGroupBy(data: any): void {
        this.emit('groupBy', data);
        const colName = data.colName;
        const entityKey = this.getData('entityKey');
        if (!entityKey) return;
        this.entityEmit(
            ENTITY_COMMAND_EVENTS.GROUP_BY,
            { groupField: colName },
            { source: entityKey }
        );
    }

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
        }
        this._columnMetaManager.compile(columns);
        this._applyColumnWidths();
        if (this._isAfterInit) {
            this._disposeAllItems();
            this._reflow();
        }
    }

    _onDataOptionChange(data: Record<string, any>[]): void {
        if (Array.isArray(data)) this._sourceData = data;
        const entityKey = this.getData('entityKey');
        if (entityKey && Array.isArray(data) && data.length > 0) {
            this.entityEmit(ENTITY_COMMAND_EVENTS.LOAD_DICTIONARY, data, { source: entityKey });
            return;
        }
        if (this._isAfterInit) this._reflow();
    }

    _reflow(): void {
        const columns = this.getData('columns') || [];
        if (columns.length === 0) return;

        if (!this._columnMetaManager) {
            this._columnMetaManager = new ColumnMetaManager();
            this._columnMetaManager.compile(columns);
        }

        this._applyColumnWidths();

        const metas = this._columnMetaManager.getAll();
        this.defaultItemOption = {
            columnMetas: metas,
            eventKey: this.eventKey,
            entityKey: this.entityKey,
        };

        const data = this.getData('entityKey') ? this._entityItems : (this.getData('data') ?? []);
        const items = this._buildItems(data, metas);
        super.setItems(items);
    }

    /**
     * 构建 item 数组：分组数据展开为「组行 + 组内行」扁平数组，通过 order 排序。
     */
    _buildItems(data: any[], metas: ColumnMeta[]): Record<string, any>[] {
        if (this._isGroupedData(data)) {
            const items: Record<string, any>[] = [];
            let order = 1;
            for (const group of data) {
                items.push({
                    type: GROUP_SUMMARY_ROW_TYPE,
                    data: this._buildGroupSummary(group, metas),
                    order: order++,
                });
                for (const rowData of group.groupItems ?? []) {
                    items.push({ data: rowData, order: order++ });
                }
            }
            return items;
        }
        return data.map((rowData: any) => ({ data: rowData }));
    }

    /** 判断是否为分组数据（[{ groupKey, groupItems }]） */
    _isGroupedData(data: any[]): boolean {
        return (
            Array.isArray(data) &&
            data.length > 0 &&
            data[0] !== null &&
            typeof data[0] === 'object' &&
            'groupKey' in data[0] &&
            Array.isArray(data[0].groupItems)
        );
    }

    /** 按 groupAggregator 计算分组汇总行数据 */
    _buildGroupSummary(group: any, metas: ColumnMeta[]): Record<string, any> {
        const summary: Record<string, any> = {};
        for (const meta of metas) {
            if (!meta.groupAggregator) continue;
            if (meta.groupAggregator === 'label') {
                summary[meta.name] = group.groupKey;
            } else {
                summary[meta.name] = this._aggregate(meta, group.groupItems ?? []);
            }
        }
        return summary;
    }

    _aggregate(meta: ColumnMeta, items: any[]): any {
        const values = items.map(row => this._getFieldValue(row, meta.field));
        switch (meta.groupAggregator) {
            case 'sum':
                return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
            case 'count':
                return items.length;
            case 'avg':
                return values.length
                    ? values.reduce((acc, v) => acc + (Number(v) || 0), 0) / values.length
                    : '';
            case 'min':
                return values.length ? Math.min(...values.map(v => Number(v))) : '';
            case 'max':
                return values.length ? Math.max(...values.map(v => Number(v))) : '';
            default:
                return '';
        }
    }

    _getFieldValue(obj: any, path: string): any {
        if (!obj || !path) return undefined;
        const keys = path.split('.');
        let val = obj;
        for (const key of keys) {
            val = val?.[key];
            if (val === undefined) break;
        }
        return val;
    }

    _applyColumnWidths(): void {
        if (!this._columnMetaManager) return;
        const metas = this._columnMetaManager.getAll();
        for (const meta of metas) {
            if (meta.width) {
                this.el!.style.setProperty(`--q-table-col-${meta.name}-width`, meta.width);
            }
        }
    }

    _disposeAllItems(): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (typeof item.dispose === 'function') item.dispose();
            }
            items.length = 0;
        }
        if (Array.isArray(this._hiddenItems)) {
            for (const item of this._hiddenItems) {
                if (typeof item.dispose === 'function') item.dispose();
            }
            this._hiddenItems.length = 0;
        }
    }

    hideColumn(name: string): void {
        if (this._header && typeof this._header.hideColumn === 'function') {
            this._header.hideColumn(name);
        }
    }

    showColumn(name: string): void {
        if (this._header && typeof this._header.showColumn === 'function') {
            this._header.showColumn(name);
        }
    }

    moveColumn(from: number, to: number): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const row of items) {
                if (typeof row.moveColumn === 'function') row.moveColumn(from, to);
            }
        }
        if (this._header && typeof this._header.moveColumn === 'function') {
            this._header.moveColumn(from, to);
        }
    }

    override dispose(): void {
        const entityKey = this.getData('entityKey');
        if (entityKey) {
            this.entityEmit(ENTITY_LIFECYCLE_EVENTS.DISCONNECT, { entityKey });
        }
        super.dispose();
    }
}

const TableComponentDefs: Definitions = {
    options: {
        columns: null,
        data: null,
        entityKey: null,
        entityType: null,
    },
    fields: {
        _isAfterInit: false,
        _columnMetaManager: null,
        _header: null,
        _entityItems: [],
        _sourceData: [],
    },
} as const;

TableComponent.define(TableComponentDefs);
TableComponent.register();

export { TableComponent };
