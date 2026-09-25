import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnDef, ColumnGroupDef } from '../column-types';
import type { GroupChildConfig } from './GroupHeaderCellComponent';
import { LeafHeaderCellComponent } from './LeafHeaderCellComponent';
import { GroupHeaderCellComponent } from './GroupHeaderCellComponent';
import { Definitions } from '@/composable';
import './header.css';

class HeaderComponent extends Component {
    static type = 'q-table-header';

    _headerCells: any[] = [];

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-header',
        };
    }

    onAfterInit(): void {
        this.el.style.display = 'flex';
        this._createHeaderCells();
        this._bindCellEvents();
    }

    _bindCellEvents(): void {
        for (const cell of this._headerCells) {
            cell.on('sortChange', (data: any) => {
                this.emit('sortChange', data);
            });
            cell.on('resize', (data: any) => {
                this.emit('resize', data);
            });
            cell.on('reorder', (data: any) => {
                this.emit('reorder', data);
            });
        }
    }

    _createHeaderCells(): void {
        const columns: ColumnDefOrGroup[] = this.getData('columns') || [];
        if (columns.length === 0) return;

        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const cell = this._createHeaderCell(col);
            if (cell) {
                this.el.appendChild(cell.el);
                cell.el.style.order = String((i + 1) * 10);
                this._headerCells.push(cell);
            }
        }
    }

    _createHeaderCell(col: ColumnDefOrGroup): any {
        if (this._isGroup(col)) {
            return this._createGroupCell(col as ColumnGroupDef);
        }
        return this._createLeafCell(col as ColumnDef);
    }

    _createLeafCell(def: ColumnDef): any {
        return new LeafHeaderCellComponent({
            colName: def.name,
            title: def.title,
            align: def.align,
            sortable: def.sortable ?? false,
            resizable: def.resizable ?? true,
            reorderable: def.reorderable ?? false,
            minWidth: def.minWidth ?? 50,
        });
    }

    _createGroupCell(def: ColumnGroupDef): any {
        const childNames = this._collectLeafNames(def.children);
        const childConfigs = def.children.map(child => this._buildChildConfig(child));

        return new GroupHeaderCellComponent({
            colName: def.name,
            title: def.title,
            childNames,
            childConfigs,
        });
    }

    _buildChildConfig(col: ColumnDefOrGroup): GroupChildConfig {
        if (this._isGroup(col)) {
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
            if (this._isGroup(col)) {
                names.push(...this._collectLeafNames((col as ColumnGroupDef).children));
            } else {
                names.push((col as ColumnDef).name);
            }
        }
        return names;
    }

    _isGroup(col: ColumnDefOrGroup): col is ColumnGroupDef {
        return 'children' in col && Array.isArray((col as ColumnGroupDef).children);
    }

    hideColumn(name: string): void {
        for (const cell of this._headerCells) {
            if (cell.colName === name) {
                cell.el.style.display = 'none';
                break;
            }
        }
    }

    showColumn(name: string): void {
        for (const cell of this._headerCells) {
            if (cell.colName === name) {
                cell.el.style.display = '';
                break;
            }
        }
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        if (from >= this._headerCells.length || to >= this._headerCells.length) return;
        const fromCell = this._headerCells[from];
        const toCell = this._headerCells[to];
        if (fromCell && toCell) {
            const fromOrder = fromCell.el.style.order;
            const toOrder = toCell.el.style.order;
            fromCell.el.style.order = toOrder;
            toCell.el.style.order = fromOrder;
        }
    }
}

const HeaderComponentDefs: Definitions = {
    options: {
        columns: null,
    },
    fields: {
        _headerCells: [],
    },
} as const;

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };
