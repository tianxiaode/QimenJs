import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';
import { GROUP_SUMMARY_ROW_TYPE } from '../constants';
import { TextCellComponent } from '../cells/TextCellComponent';
import type { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './groupsummaryrow.css';

class GroupSummaryRowComponent extends Component {
    static type = GROUP_SUMMARY_ROW_TYPE;

    _cells: Map<string, any> = new Map();
    _collapsed: boolean = false;

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-table-row q-table-row--group-summary',
        };
    }

    domEvents: DomEventsMap = {
        click: { path: 'root', handler: '_onToggle' },
    };

    onAfterInit(): void {
        this._createCells();

        const data = this.getData('data');
        if (data) {
            this._applyData(data);
        }
    }

    _onToggle(): void {
        this._collapsed = !this._collapsed;
        if (this._collapsed) {
            this.addCls('q-table-row--collapsed');
        } else {
            this.removeCls('q-table-row--collapsed');
        }
        this.componentEmit('groupToggle', {
            groupKey: this.getData('data')?._groupKey,
            collapsed: this._collapsed,
        });
    }

    _createCells(): void {
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];

        for (let i = 0; i < columns.length; i++) {
            const meta = columns[i];
            const cell = new TextCellComponent({ align: meta.align, format: meta.format });
            this.el.appendChild(cell.el);
            this._cells.set(meta.name, cell);
            cell.order = (i + 1) * 10;

            if (meta.width) {
                cell.el.style.width = `var(--q-table-col-${meta.name}-width)`;
                cell.flexShrink = '0';
            }
        }
    }

    update(props: any): void {
        if (!props?.data) return;
        this._applyData(props.data);
    }

    _applyData(data: any): void {
        if (!data) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        for (const meta of columns) {
            const cell = this._cells.get(meta.name);
            if (cell && typeof cell.update === 'function') {
                const value = data[meta.name];
                if (meta.groupAggregator === 'label') {
                    cell.update({ value: value ?? '' });
                } else if (value !== undefined) {
                    cell.update({ value, format: meta.format });
                } else {
                    cell.update({ value: '' });
                }
            }
        }
    }

    hideColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = true;
    }

    showColumn(name: string): void {
        const cell = this._cells.get(name);
        if (cell) cell.hidden = false;
    }

    moveColumn(from: number, to: number): void {
        if (from === to || from < 0 || to < 0) return;
        const columns: ColumnMeta[] = this.getData('columnMetas') || [];
        if (from >= columns.length || to >= columns.length) return;
        const fromName = columns[from].name;
        const toName = columns[to].name;
        const fromCell = this._cells.get(fromName);
        const toCell = this._cells.get(toName);
        if (fromCell && toCell) {
            const fromOrder = fromCell.order;
            const toOrder = toCell.order;
            fromCell.order = toOrder;
            toCell.order = fromOrder;
        }
    }
}

const GroupSummaryRowComponentDefs: Definitions = {
    options: {
        display: 'flex',
        columnMetas: null,
        data: null,
    },
    fields: {
        _cells: null,
        _collapsed: false,
    },
} as const;

GroupSummaryRowComponent.define(GroupSummaryRowComponentDefs);
GroupSummaryRowComponent.register();

export { GroupSummaryRowComponent };
