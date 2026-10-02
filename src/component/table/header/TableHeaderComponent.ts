import { ItemGroupPooledComponent } from '../../itemgroup/ItemGroupPooledComponent';
import type { ColumnDefOrGroup, ColumnDef, ColumnGroupDef } from '../column-types';
import type { GroupChildConfig } from './GroupHeaderCellComponent';
import type { DomEventsMap, ListenItem, TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './header.css';

class TableHeaderComponent extends ItemGroupPooledComponent {
    static type = 'table-header';
    defaultItemType = 'header-cell';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table-header',
            children: [{ tag: 'div', name: 'itemContainer', classes: 'q-table-header__cells' }],
        };
    }

    domEvents: DomEventsMap = {
        click: [{ path: '[items]', handler: '_onHeaderCellClick' }],
    };

    _groupField: string = '';
    _dragColName: string = '';
    _dropIndicator: HTMLElement | null = null;

    get defaultEventData(): Record<string, any> {
        return {
            sortBy: this.getData('sortBy') ?? '',
            sortOrder: this.getData('sortOrder') ?? '',
            groupField: this.getData('groupField') ?? '',
        };
    }

    listens: ListenItem[] = [
        {
            source: 'self',
            events: {
                sort: { handler: '_onSort', entities: '[action]' },
                groupBy: { handler: '_onGroupBy', entities: '[action]' },
                hideColumn: { handler: '_onHideColumn', bridges: ['[action]'] },
                showColumn: { handler: '_onShowColumn', bridges: ['[action]'] },
            },
        },
    ];

    onAfterInit(): void {
        super.onAfterInit();
        const el = this.el;
        if (!el) return;
        el.addEventListener('dragstart', this._onDragStart);
        el.addEventListener('dragover', this._onDragOver);
        el.addEventListener('dragleave', this._onDragLeave);
        el.addEventListener('drop', this._onDrop);
        el.addEventListener('dragend', this._onDragEnd);
        this.onCleanup(() => {
            el.removeEventListener('dragstart', this._onDragStart);
            el.removeEventListener('dragover', this._onDragOver);
            el.removeEventListener('dragleave', this._onDragLeave);
            el.removeEventListener('drop', this._onDrop);
            el.removeEventListener('dragend', this._onDragEnd);
        });
    }

    _findCellByTarget(target: HTMLElement): any {
        const items = this.items;
        if (!Array.isArray(items)) return null;
        for (const item of items) {
            if (item?.el && item.el.contains(target)) return item;
        }
        return null;
    }

    _onDragStart = (e: DragEvent): void => {
        const cell = this._findCellByTarget(e.target as HTMLElement);
        if (!cell) return;
        if (!cell.reorderable) {
            e.preventDefault();
            return;
        }
        this._dragColName = cell.colName ?? cell.action ?? '';
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.setData('text/plain', this._dragColName);
    };

    _onDragOver = (e: DragEvent): void => {
        if (!this._dragColName) return;
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        const cell = this._findCellByTarget(e.target as HTMLElement);
        if (!cell) return;
        const targetColName = cell.colName ?? cell.action ?? '';
        if (targetColName === this._dragColName) {
            this._hideDropIndicator();
            return;
        }
        const rect = cell.el.getBoundingClientRect();
        const isLeft = e.clientX < rect.left + rect.width / 2;
        this._showDropIndicator(cell.el, isLeft);
    };

    _onDragLeave = (e: DragEvent): void => {
        if (!this.el?.contains(e.relatedTarget as HTMLElement)) {
            this._hideDropIndicator();
        }
    };

    _onDrop = (e: DragEvent): void => {
        e.preventDefault();
        this._hideDropIndicator();
        if (!this._dragColName) return;
        const cell = this._findCellByTarget(e.target as HTMLElement);
        if (!cell) return;
        const targetColName = cell.colName ?? cell.action ?? '';
        if (targetColName === this._dragColName) return;
        this._reorderColumns(this._dragColName, targetColName);
        this._dragColName = '';
    };

    _onDragEnd = (): void => {
        this._dragColName = '';
        this._hideDropIndicator();
    };

    _showDropIndicator(cellEl: HTMLElement, isLeft: boolean): void {
        if (!this._dropIndicator) {
            this._dropIndicator = document.createElement('div');
            this._dropIndicator.className = 'q-header-cell__drop-indicator';
        }
        const rect = cellEl.getBoundingClientRect();
        const headerRect = this.el!.getBoundingClientRect();
        this._dropIndicator.style.left = `${(isLeft ? rect.left : rect.right) - headerRect.left}px`;
        this._dropIndicator.style.top = '0';
        this._dropIndicator.style.height = `${headerRect.height}px`;
        if (this._dropIndicator.parentNode !== this.el) {
            this.el!.appendChild(this._dropIndicator);
        }
    }

    _hideDropIndicator(): void {
        if (this._dropIndicator?.parentNode) {
            this._dropIndicator.parentNode.removeChild(this._dropIndicator);
        }
    }

    _reorderColumns(fromName: string, toName: string): void {
        const columns = this.columns;
        if (!Array.isArray(columns)) return;
        const fromIdx = columns.findIndex((c: any) => c.name === fromName);
        const toIdx = columns.findIndex((c: any) => c.name === toName);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
        const newColumns = [...columns];
        const [moved] = newColumns.splice(fromIdx, 1);
        newColumns.splice(toIdx, 0, moved);
        this.setData('columns', newColumns);
        this.emit('reorder', { columns: newColumns, from: fromName, to: toName });
    }

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        const items = columns.map(col => this._buildItemData(col));
        this.setItems(items);
    }

    _buildItemData(col: ColumnDefOrGroup): Record<string, any> {
        const hideableColumns = this._collectHideableColumns();
        const eventKey = this.eventKey;
        if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
            const group = col as ColumnGroupDef;
            const childNames = this._collectLeafNames(group.children);
            const childConfigs = group.children.map(child => this._buildChildConfig(child));
            return {
                type: 'group-header-cell',
                colName: group.name,
                title: group.title,
                action: group.name,
                childNames,
                childConfigs,
                hideableColumns,
                eventKey,
            };
        }
        const leaf = col as ColumnDef;
        return {
            type: 'header-cell',
            colName: leaf.name,
            title: leaf.title,
            align: 'center',
            sortable: leaf.sortable ?? false,
            resizable: leaf.resizable ?? true,
            reorderable: leaf.reorderable ?? false,
            action: leaf.name,
            minWidth: leaf.minWidth ?? 50,
            hideableColumns,
            groupable: leaf.groupable ?? false,
            groupField: this.getData('groupField') ?? '',
            customMenuItems: leaf.menuItems ?? null,
            eventKey,
        };
    }

    _buildChildConfig(col: ColumnDefOrGroup): GroupChildConfig {
        if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
            const group = col as ColumnGroupDef;
            return {
                type: 'group',
                colName: group.name,
                title: group.title,
                children: group.children.map(child => this._buildChildConfig(child)),
            };
        }
        const leaf = col as ColumnDef;
        return {
            type: 'leaf',
            colName: leaf.name,
            title: leaf.title,
            align: leaf.align,
            sortable: leaf.sortable ?? false,
            resizable: leaf.resizable ?? true,
            reorderable: leaf.reorderable ?? false,
            minWidth: leaf.minWidth ?? 50,
            groupable: leaf.groupable ?? false,
            groupField: this.getData('groupField') ?? '',
            hideableColumns: this._collectHideableColumns(),
        };
    }

    _collectLeafNames(columns: ColumnDefOrGroup[]): string[] {
        const names: string[] = [];
        for (const col of columns) {
            if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
                names.push(...this._collectLeafNames((col as ColumnGroupDef).children));
            } else {
                names.push((col as ColumnDef).name);
            }
        }
        return names;
    }

    _collectHideableColumns(): Array<{ colName: string; title?: string; hidden: boolean }> {
        const columns = this.columns;
        if (!Array.isArray(columns)) return [];
        const result: Array<{ colName: string; title?: string; hidden: boolean }> = [];
        for (const col of columns) {
            if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
                continue;
            }
            const leaf = col as ColumnDef;
            result.push({ colName: leaf.name, title: leaf.title, hidden: leaf.hidden ?? false });
        }
        return result;
    }

    _createItem(data: Record<string, any>): any {
        return super._createItem(data);
    }

    _onHeaderCellClick(domEvt: any): void {
        const target = domEvt?.targetComponent;
        if (!target) return;
        const colName = target.action || target.colName;

        const originalEvent = domEvt?.data?.originalEvent;
        const clickTarget = originalEvent?.target as HTMLElement;

        const menuIconEl = target.getNodeEl?.('menuIcon');
        if (menuIconEl && (menuIconEl === clickTarget || menuIconEl.contains(clickTarget))) {
            return;
        }

        const resizeHandleEl = target.getNodeEl?.('resizeHandle');
        if (
            resizeHandleEl &&
            (resizeHandleEl === clickTarget || resizeHandleEl.contains(clickTarget))
        ) {
            return;
        }

        if (target.sortable) {
            const currentState = target.sortState || 'none';
            const nextState =
                currentState === 'none' ? 'asc' : currentState === 'asc' ? 'desc' : 'none';
            this.componentEmit('sort', { colName, direction: nextState });
        }
    }

    _onSort(data: any): void {
        this._applySort(data.colName, data.direction);
    }

    _onGroupBy(data: any): void {
        const currentGroupField = this.getData('groupField') ?? '';
        const newGroupField = currentGroupField === data.colName ? '' : data.colName;
        this.setData('groupField', newGroupField);
        this._updateCellGroupField(newGroupField);
    }

    _onHideColumn(data: any): void {
        const colName = data.colName;
        const columns = this.columns;
        if (Array.isArray(columns)) {
            const col = columns.find((c: any) => c.name === colName && !('children' in c)) as
                | ColumnDef
                | undefined;
            if (col) {
                col.hidden = true;
                this.hideColumn(colName);
                this._updateCellHideableColumns();
            }
        }
    }

    _onShowColumn(data: any): void {
        const colName = data.colName;
        const columns = this.columns;
        if (Array.isArray(columns)) {
            const col = columns.find((c: any) => c.name === colName && !('children' in c)) as
                | ColumnDef
                | undefined;
            if (col) {
                col.hidden = false;
                this.showColumn(colName);
                this._updateCellHideableColumns();
            }
        }
    }

    _updateCellGroupField(groupField: string): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (typeof item.setData === 'function') {
                    item.setData('groupField', groupField);
                }
            }
        }
    }

    _updateCellHideableColumns(): void {
        const hideableColumns = this._collectHideableColumns();
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (typeof item.setData === 'function') {
                    item.setData('hideableColumns', hideableColumns);
                }
            }
        }
    }

    _applySort(colName: string, direction: 'asc' | 'desc' | 'none'): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item.sortState !== undefined) {
                    item.sortState = item.action === colName ? direction : 'none';
                }
            }
        }
        this.setData('sortBy', colName);
        this.setData('sortOrder', direction === 'none' ? '' : direction);
    }

    hideColumn(name: string): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item.action === name || item.colName === name) {
                    item.hidden = true;
                    break;
                }
            }
        }
    }

    showColumn(name: string): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item.action === name || item.colName === name) {
                    item.hidden = false;
                    break;
                }
            }
        }
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        if (from >= items.length || to >= items.length) return;
        const fromItem = items[from];
        const toItem = items[to];
        if (fromItem && toItem) {
            const fromOrder = fromItem.getData('order');
            const toOrder = toItem.getData('order');
            fromItem.setData('order', toOrder);
            toItem.setData('order', fromOrder);
        }
    }
}

const TableHeaderComponentDefs: Definitions = {
    options: {
        columns: null,
        direction: 'horizontal',
        sortBy: '',
        sortOrder: '',
        groupField: '',
    },
} as const;

TableHeaderComponent.define(TableHeaderComponentDefs);

export { TableHeaderComponent };
