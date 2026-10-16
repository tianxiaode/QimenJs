import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import type { ColumnMeta } from '../column-types';
import { EditOverlayComponent } from '../edit-overlay/EditOverlayComponent';

/**
 * TableEditAbility — 表格行编辑能力
 *
 * 双击行触发编辑：创建透明浮动层覆盖在行上方，
 * 只在 editable 单元格位置显示 input，行右侧显示取消/保存按钮。
 *
 * 关键设计：
 * - 透明浮动层覆盖行：不破坏行 DOM，视觉上是行内直接编辑
 * - input 只出现在 editable 单元格位置：通过 cell.getBoundingClientRect() 精确定位
 * - 取消/保存按钮在行右侧：不遮挡单元格内容
 * - EditOverlayComponent 通过 domEvents 委托按钮 click，通过 componentEmit 通知 TableComponent
 * - TableComponent 通过 listens 声明式监听 editSave/editCancel
 * - 验证错误：input 标红 + 下方错误提示
 */
export const TableEditAbility = {
    _editOverlay: null as EditOverlayComponent | null,
    _editingRowKey: null as string | null,
    _editingRowData: null as any | null,
    _editingRow: null as any | null,
    _editScrollUnbind: null as (() => void) | null,
    _editScrollOff: null as (() => void) | null,

    _onRowEditTrigger(this: TableAbilityHost, domEvt: any): void {
        const trigger = this.getData('editTrigger') ?? 'dblclick';
        if (trigger !== 'dblclick') return;

        const row = domEvt?.targetComponent;
        if (!row) return;

        const rowData = row.getData('data');
        if (!rowData) return;

        const metas = this._columnMetaManager?.getAll() ?? [];
        const editableMetas = metas.filter((m: ColumnMeta) => m.editable);
        if (editableMetas.length === 0) return;

        const editMode = this.getData('editMode') ?? 'row';
        let targetMetas = editableMetas;

        if (editMode === 'cell') {
            const clickTarget = domEvt?.data?.originalEvent?.target as HTMLElement | undefined;
            const clickedColName = this._findClickedColName(row, clickTarget);
            if (!clickedColName) return;
            targetMetas = editableMetas.filter((m: ColumnMeta) => m.name === clickedColName);
            if (targetMetas.length === 0) return;
        }

        this._startEdit(row, rowData, targetMetas);
    },

    _findClickedColName(this: TableAbilityHost, row: any, clickTarget: HTMLElement | undefined): string | null {
        if (!clickTarget) return null;
        for (const [colName, cell] of row._cells ?? []) {
            if (cell?.el?.contains(clickTarget)) {
                return colName;
            }
        }
        return null;
    },

    _startEdit(this: TableAbilityHost, row: any, rowData: any, editableMetas: ColumnMeta[]): void {
        if (this._editOverlay) {
            this._closeEditOverlay();
        }

        this._editingRowKey = rowData._rowKey ?? String(rowData.id ?? '');
        this._editingRowData = rowData;
        this._editingRow = row;

        const cellPositions = this._collectCellPositions(row, editableMetas);
        const rowRect = row.el.getBoundingClientRect();

        let actionsLeft: number | null = null;
        if (cellPositions.length > 0) {
            const lastPos = cellPositions[cellPositions.length - 1];
            const lastRight = lastPos.left + lastPos.width;
            if (rowRect.width - lastRight >= 56) {
                actionsLeft = lastRight + 4;
            }
        }

        const eventKey = this.eventKey ?? this.getData('eventKey');
        const editRules = this.getData('editRules');

        const overlay = new EditOverlayComponent({
            editableMetas,
            cellPositions,
            actionsLeft,
            rowKey: this._editingRowKey,
            eventKey,
            editRules,
        });
        this._editOverlay = overlay;

        Promise.resolve(overlay.ready).then(() => {
            if (this._editOverlay !== overlay) return;

            this._syncOverlayPosition();
            overlay.mountToOverlay(overlay.el);
            overlay.activate(rowData);
            this._bindScrollSync();
        });
    },

    _onEditSave(this: TableAbilityHost, data: any): void {
        this.emit('editSave', data);
        this._closeEditOverlay();
    },

    _onEditCancel(this: TableAbilityHost, data: any): void {
        this.emit('editCancel', data);
        this._closeEditOverlay();
    },

    _syncOverlayPosition(this: TableAbilityHost): void {
        if (!this._editOverlay || !this._editingRow) return;
        const rowRect = this._editingRow.el.getBoundingClientRect();
        const overlay = this._editOverlay;
        overlay.el.style.position = 'fixed';
        overlay.el.style.left = `${rowRect.left}px`;
        overlay.el.style.top = `${rowRect.top}px`;
        overlay.el.style.width = `${rowRect.width}px`;
        overlay.el.style.height = `${rowRect.height}px`;
    },

    _bindScrollSync(this: TableAbilityHost): void {
        if (this._editScrollUnbind) return;
        this._editScrollUnbind = this.bind(document, 'scroll', { capture: true });
        this._editScrollOff = this.on('dom:scroll', () => this._syncOverlayPosition());
    },

    _unbindScrollSync(this: TableAbilityHost): void {
        if (this._editScrollUnbind) {
            this._editScrollUnbind();
            this._editScrollUnbind = null;
        }
        if (this._editScrollOff) {
            this._editScrollOff();
            this._editScrollOff = null;
        }
    },

    _collectCellPositions(this: TableAbilityHost, row: any, editableMetas: ColumnMeta[]): any[] {
        const positions: any[] = [];
        const rowRect = row.el.getBoundingClientRect();

        for (const meta of editableMetas) {
            const cell = row._cells?.get(meta.name);
            if (!cell?.el) continue;
            const cellRect = cell.el.getBoundingClientRect();
            positions.push({
                colName: meta.name,
                left: cellRect.left - rowRect.left,
                top: cellRect.top - rowRect.top,
                width: cellRect.width,
                height: cellRect.height,
            });
        }

        return positions;
    },

    _closeEditOverlay(this: TableAbilityHost): void {
        if (!this._editOverlay) return;

        this._unbindScrollSync();
        this._editOverlay.deactivate();
        this._editOverlay.unmountFromOverlay(this._editOverlay.el);
        this._editOverlay.dispose();
        this._editOverlay = null;
        this._editingRowKey = null;
        this._editingRowData = null;
        this._editingRow = null;
    },
} satisfies AbilityDefinition;
