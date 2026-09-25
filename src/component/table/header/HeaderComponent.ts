import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ColumnDefOrGroup, ColumnDef, ColumnGroupDef } from '../column-types';
import type { GroupChildConfig } from './GroupHeaderCellComponent';
import { LeafHeaderCellComponent } from './LeafHeaderCellComponent';
import { GroupHeaderCellComponent } from './GroupHeaderCellComponent';
import type { DomEventsMap, TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './header.css';

class HeaderComponent extends ItemGroupPooledComponent {
    static type = 'q-table-header';
    defaultItemType = 'q-header-leaf-cell';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-table-header',
            children: [
                { tag: 'div', name: 'itemContainer', classes: 'q-table-header__cells' },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: [
            { path: '[items]', handler: '_onHeaderCellClick' },
        ],
    };

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        const items = columns.map(col => this._buildItemData(col));
        this.setItems(items);
    }

    _buildItemData(col: ColumnDefOrGroup): Record<string, any> {
        if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
            const group = col as ColumnGroupDef;
            const childNames = this._collectLeafNames(group.children);
            const childConfigs = group.children.map(child => this._buildChildConfig(child));
            return {
                type: 'q-header-group-cell',
                colName: group.name,
                title: group.title,
                action: group.name,
                childNames,
                childConfigs,
            };
        }
        const leaf = col as ColumnDef;
        return {
            type: 'q-header-leaf-cell',
            colName: leaf.name,
            title: leaf.title,
            align: leaf.align,
            sortable: leaf.sortable ?? false,
            resizable: leaf.resizable ?? true,
            reorderable: leaf.reorderable ?? false,
            action: leaf.name,
            minWidth: leaf.minWidth ?? 50,
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

    _createItem(data: Record<string, any>): any {
        const item = super._createItem(data);
        if (item && typeof item.on === 'function') {
            item.on('resize', (resizeData: any) => {
                this.emit('resize', resizeData);
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

        const menuEl = target.getNodeEl?.('menu');
        if (menuEl && menuEl.contains(clickTarget)) {
            this._onMenuItemClick(target, clickTarget, colName);
            return;
        }

        const menuIconEl = target.getNodeEl?.('menuIcon');
        if (menuIconEl && (menuIconEl === clickTarget || menuIconEl.contains(clickTarget))) {
            target._toggleMenu?.();
            return;
        }

        const resizeHandleEl = target.getNodeEl?.('resizeHandle');
        if (resizeHandleEl && (resizeHandleEl === clickTarget || resizeHandleEl.contains(clickTarget))) {
            return;
        }

        if (target.sortable) {
            const currentState = target.sortState || 'none';
            const nextState = currentState === 'none' ? 'asc' : currentState === 'asc' ? 'desc' : 'none';
            this._applySort(colName, nextState);
        }
    }

    _onMenuItemClick(cell: any, clickTarget: HTMLElement, colName: string): void {
        const sortAscEl = cell.getNodeEl?.('sortAscItem');
        const sortDescEl = cell.getNodeEl?.('sortDescItem');
        const hideColEl = cell.getNodeEl?.('hideColumnItem');

        if (sortAscEl?.contains(clickTarget)) {
            this._applySort(colName, 'asc');
        } else if (sortDescEl?.contains(clickTarget)) {
            this._applySort(colName, 'desc');
        } else if (hideColEl?.contains(clickTarget)) {
            this.emit('hideColumn', { colName });
        }
        cell._closeMenu?.();
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
                    item.el.style.display = 'none';
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
                    item.el.style.display = '';
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
        if (fromItem?.el && toItem?.el) {
            const fromOrder = fromItem.el.style.order;
            const toOrder = toItem.el.style.order;
            fromItem.el.style.order = toOrder;
            toItem.el.style.order = fromOrder;
        }
    }
}

const HeaderComponentDefs: Definitions = {
    options: {
        columns: null,
        direction: 'horizontal',
    },
} as const;

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };
