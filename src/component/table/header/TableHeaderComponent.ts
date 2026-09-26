import { ItemGroupPooledComponent } from '../../itemgroup/ItemGroupPooledComponent';
import type { ColumnDefOrGroup, ColumnDef, ColumnGroupDef } from '../column-types';
import type { GroupChildConfig } from './GroupHeaderCellComponent';
import type { DomEventsMap, TemplateDecl } from '@qimenjs/component-core';
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

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        const items = columns.map(col => this._buildItemData(col));
        this.setItems(items);
    }

    _buildItemData(col: ColumnDefOrGroup): Record<string, any> {
        const hideableColumns = this._collectHideableColumns();
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
            customMenuItems: leaf.menuItems ?? null,
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
        const item = super._createItem(data);
        if (item && typeof item.on === 'function') {
            item.on('resize', (resizeData: any) => {
                this.emit('resize', resizeData);
            });
            item.on('menuSelect', (menuData: any) => {
                this._onMenuSelect(menuData);
            });
        }
        return item;
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
            this._applySort(colName, nextState);
        }
    }

    _onMenuSelect(data: any): void {
        const { action, colName } = data;
        if (action === 'sortAsc') {
            this._applySort(colName, 'asc');
        } else if (action === 'sortDesc') {
            this._applySort(colName, 'desc');
        } else if (action === 'groupBy') {
            this.emit('groupBy', { colName });
        } else if (action?.startsWith('toggleColumn:')) {
            const targetColName = action.substring('toggleColumn:'.length);
            const columns = this.columns;
            if (Array.isArray(columns)) {
                const col = columns.find(
                    (c: any) => c.name === targetColName && !('children' in c)
                ) as ColumnDef | undefined;
                if (col?.hidden) {
                    this.emit('showColumn', { colName: targetColName });
                } else {
                    this.emit('hideColumn', { colName: targetColName });
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
        this.emit('sortChange', {
            colName,
            direction: direction === 'none' ? null : direction,
        });
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
            const fromOrder = fromItem.order;
            const toOrder = toItem.order;
            fromItem.order = toOrder;
            toItem.order = fromOrder;
        }
    }
}

const TableHeaderComponentDefs: Definitions = {
    options: {
        columns: null,
        direction: 'horizontal',
    },
} as const;

TableHeaderComponent.define(TableHeaderComponentDefs);

export { TableHeaderComponent };
