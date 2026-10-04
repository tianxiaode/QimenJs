import { ItemGroupPooledComponent } from '../../itemgroup/ItemGroupPooledComponent';
import { ColumnOrderAbility } from '@qimenjs/component-abilities';
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
                reorderStart: { handler: '_onReorderStart' },
                reorderMove: { handler: '_onReorderMove' },
                reorderEnd: { handler: '_onReorderEnd' },
                toggleAll: { handler: '_onToggleAll' },
            },
        },
    ];

    _onToggleAll(data: any): void {
        this.emit('toggleAll', data);
    }

    /**
     * 设置全选状态 — 由 Table 在 selectionChange 后同步
     *
     * @param allSelected - 全部选中
     * @param someSelected - 部分选中（半选）
     */
    setSelectAllState(allSelected: boolean, someSelected: boolean): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (item.selectionAll && typeof item.setSelectAllState === 'function') {
                item.setSelectAllState(allSelected, someSelected);
            }
        }
    }

    _findCellAtPosition(clientX: number, clientY: number): any {
        const items = this.items;
        if (!Array.isArray(items)) return null;
        for (const item of items) {
            if (!item?.el) continue;
            const rect = item.el.getBoundingClientRect();
            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                if (Array.isArray(item._childCells) && item._childCells.length > 0) {
                    for (const childCell of item._childCells) {
                        if (!childCell?.el) continue;
                        const childRect = childCell.el.getBoundingClientRect();
                        if (
                            clientX >= childRect.left &&
                            clientX <= childRect.right &&
                            clientY >= childRect.top &&
                            clientY <= childRect.bottom
                        ) {
                            return childCell.component;
                        }
                    }
                }
                return item;
            }
        }
        return null;
    }

    _onReorderStart(data: any): void {
        this._dragColName = data?.colName ?? '';
    }

    _onReorderMove(data: any): void {
        if (!this._dragColName) return;
        const clientX = data?.clientX ?? 0;
        const clientY = data?.clientY ?? 0;
        const cell = this._findCellAtPosition(clientX, clientY);
        if (!cell) {
            this._hideDropIndicator();
            return;
        }
        const targetColName = cell.colName ?? cell.action ?? '';
        if (targetColName === this._dragColName) {
            this._hideDropIndicator();
            return;
        }
        const rect = cell.el.getBoundingClientRect();
        const isLeft = clientX < rect.left + rect.width / 2;
        this._showDropIndicator(cell.el, isLeft);
    }

    _onReorderEnd(data: any): void {
        if (!this._dragColName) return;
        const clientX = data?.clientX ?? 0;
        const clientY = data?.clientY ?? 0;
        const cell = this._findCellAtPosition(clientX, clientY);
        this._hideDropIndicator();
        if (!cell) {
            this._dragColName = '';
            return;
        }
        const targetColName = cell.colName ?? cell.action ?? '';
        if (targetColName !== this._dragColName) {
            const rect = cell.el.getBoundingClientRect();
            const isLeft = clientX < rect.left + rect.width / 2;
            this._reorderColumns(this._dragColName, targetColName, isLeft);
        }
        this._dragColName = '';
    }

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

    _findParentGroup(colName: string): string | null {
        const columns = this.columns;
        if (!Array.isArray(columns)) return null;
        for (const col of columns) {
            if ('children' in col && Array.isArray((col as ColumnGroupDef).children)) {
                const group = col as ColumnGroupDef;
                if (group.children.some((c: any) => c.name === colName)) {
                    return group.name;
                }
            }
        }
        return null;
    }

    _reorderColumns(fromName: string, toName: string, isLeft: boolean = true): void {
        const columns = this.columns;
        if (!Array.isArray(columns)) return;

        const fromIdx = columns.findIndex((c: any) => c.name === fromName);
        const toIdx = columns.findIndex((c: any) => c.name === toName);

        if (fromIdx !== -1 && toIdx !== -1) {
            if (fromIdx === toIdx) return;
            const newColumns = [...columns];
            const [moved] = newColumns.splice(fromIdx, 1);
            const adjustedToIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
            const insertIdx = isLeft ? adjustedToIdx : adjustedToIdx + 1;
            newColumns.splice(insertIdx, 0, moved);
            this.setData('columns', newColumns, true);
            this.reorderColumn(fromName, toName, isLeft);
            this.emit('reorder', { columns: newColumns, from: fromName, to: toName, isLeft });
            return;
        }

        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            if (!('children' in col) || !Array.isArray((col as ColumnGroupDef).children)) continue;
            const group = col as ColumnGroupDef;
            const childFromIdx = group.children.findIndex((c: any) => c.name === fromName);
            const childToIdx = group.children.findIndex((c: any) => c.name === toName);
            if (childFromIdx !== -1 && childToIdx !== -1) {
                if (childFromIdx === childToIdx) return;
                const newChildren = [...group.children];
                const [moved] = newChildren.splice(childFromIdx, 1);
                const adjustedToIdx = childFromIdx < childToIdx ? childToIdx - 1 : childToIdx;
                const insertIdx = isLeft ? adjustedToIdx : adjustedToIdx + 1;
                newChildren.splice(insertIdx, 0, moved);
                const newColumns = [...columns];
                newColumns[i] = { ...group, children: newChildren };
                this.setData('columns', newColumns, true);
                this.reorderColumn(fromName, toName, isLeft);
                this.emit('reorder', { columns: newColumns, from: fromName, to: toName, isLeft });
                return;
            }
        }

        if (fromIdx !== -1 && toIdx === -1) {
            const parentName = this._findParentGroup(toName);
            if (parentName) {
                this._reorderColumns(fromName, parentName, isLeft);
                return;
            }
        }

        if (fromIdx === -1 && toIdx !== -1) {
            const parentName = this._findParentGroup(fromName);
            if (parentName) {
                this._reorderColumns(parentName, toName, isLeft);
                return;
            }
        }
    }

    _onColumnsOptionChange(columns: ColumnDefOrGroup[]): void {
        const items = columns.map(col => this._buildItemData(col));
        this.setItems(items);
        this._registerColumnOrders();
    }

    _registerColumnOrders(): void {
        if (!this.getColumnOrderCount()) {
            this.initColumnOrder({ useCssVar: false, step: this.step });
        }
        const columns = this.columns;
        if (!Array.isArray(columns)) return;

        const leafNames = this._collectLeafNames(columns);
        const leafIndexMap = new Map<string, number>();
        for (let i = 0; i < leafNames.length; i++) {
            leafIndexMap.set(leafNames[i], i);
        }

        const items = this.items;
        if (!Array.isArray(items)) return;

        for (const item of items) {
            if (!item?.el) continue;
            const colName = item.colName || item.action;
            if (!colName) continue;

            if (item.type === 'group-header-cell') {
                const childLeafNames: string[] = item.childNames || [];
                const childIndices = childLeafNames
                    .map((n: string) => leafIndexMap.get(n))
                    .filter((i: number | undefined) => i !== undefined) as number[];
                if (childIndices.length > 0) {
                    const minLeafIndex = Math.min(...childIndices);
                    const step = this.step ?? 100;
                    const groupOrder = (minLeafIndex + 1) * step - Math.floor(step / 2);
                    this.registerColumnEntry(colName, item, minLeafIndex, {
                        isLeaf: false,
                        order: groupOrder,
                    });
                }
            } else {
                const leafIndex = leafIndexMap.get(colName) ?? 0;
                this.registerColumnEntry(colName, item, leafIndex, {
                    isLeaf: true,
                });
            }
        }
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
        const isSelectionCol = !!leaf.selection && this.getData('selectable') === 'multiple';
        return {
            type: 'header-cell',
            colName: leaf.name,
            title: isSelectionCol ? null : leaf.title,
            align: 'center',
            sortable: isSelectionCol ? false : leaf.sortable ?? false,
            resizable: leaf.resizable ?? true,
            reorderable: leaf.reorderable ?? false,
            action: leaf.name,
            minWidth: leaf.minWidth ?? 50,
            hideableColumns,
            groupable: isSelectionCol ? false : leaf.groupable ?? false,
            groupField: this.getData('groupField') ?? '',
            customMenuItems: leaf.menuItems ?? null,
            menuDisabled: isSelectionCol,
            selectionAll: isSelectionCol,
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

        const selectAllEl = target.getNodeEl?.('selectAllBox');
        if (selectAllEl && (selectAllEl === clickTarget || selectAllEl.contains(clickTarget))) {
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

TableHeaderComponent.use([ColumnOrderAbility]);
TableHeaderComponent.define(TableHeaderComponentDefs);

export { TableHeaderComponent };
