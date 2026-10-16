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
 * - 必须点取消按钮关闭：不响应点击外部/Escape
 * - 验证错误：input 标红 + 下方错误提示
 */
export const TableEditAbility = {
    _editOverlay: null as EditOverlayComponent | null,
    _editingRowKey: null as string | null,
    _editingRowData: null as any | null,

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

        this._startEdit(row, rowData, editableMetas);
    },

    _startEdit(this: TableAbilityHost, row: any, rowData: any, editableMetas: ColumnMeta[]): void {
        if (this._editOverlay) {
            this._cancelEdit();
        }

        this._editingRowKey = rowData._rowKey ?? String(rowData.id ?? '');
        this._editingRowData = rowData;

        const cellPositions = this._collectCellPositions(row, editableMetas);
        const rowRect = row.el.getBoundingClientRect();

        const overlay = new EditOverlayComponent({
            editableMetas,
            cellPositions,
        });
        this._editOverlay = overlay;

        Promise.resolve(overlay.ready).then(() => {
            if (this._editOverlay !== overlay) return;

            overlay.el.style.position = 'fixed';
            overlay.el.style.left = `${rowRect.left}px`;
            overlay.el.style.top = `${rowRect.top}px`;
            overlay.el.style.width = `${rowRect.width}px`;
            overlay.el.style.height = `${rowRect.height}px`;

            overlay.mountToOverlay(overlay.el);

            overlay.activate(rowData);

            this._bindEditActions();
        });
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

    _bindEditActions(this: TableAbilityHost): void {
        if (!this._editOverlay) return;

        const saveBtn = this._editOverlay.getNodeEl('saveBtn');
        const cancelBtn = this._editOverlay.getNodeEl('cancelBtn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this._saveEdit());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this._cancelEdit());
        }
    },

    _saveEdit(this: TableAbilityHost): void {
        if (!this._editOverlay) return;

        const values = this._editOverlay.getEditValues();
        const errors = this._validateEditValues(values);

        if (Object.keys(errors).length > 0) {
            this._editOverlay.showErrors(errors);
            return;
        }

        const rowKey = this._editingRowKey;
        const originalValues = this._editOverlay.getOriginalValues();

        this.componentEmit('editSave', {
            rowKey,
            originalValues,
            newValues: values,
        });

        this._closeEditOverlay();
    },

    _cancelEdit(this: TableAbilityHost): void {
        if (!this._editOverlay) return;

        const rowKey = this._editingRowKey;
        const originalValues = this._editOverlay.getOriginalValues();

        this.componentEmit('editCancel', {
            rowKey,
            originalValues,
        });

        this._closeEditOverlay();
    },

    _closeEditOverlay(this: TableAbilityHost): void {
        if (!this._editOverlay) return;

        this._editOverlay.deactivate();
        this._editOverlay.unmountFromOverlay(this._editOverlay.el);
        this._editOverlay.dispose();
        this._editOverlay = null;
        this._editingRowKey = null;
        this._editingRowData = null;
    },

    _validateEditValues(this: TableAbilityHost, values: Record<string, any>): Record<string, string> {
        const errors: Record<string, string> = {};
        const metas = this._columnMetaManager?.getAll() ?? [];
        const editRules = this.getData('editRules') ?? {};

        for (const meta of metas) {
            if (!meta.editable) continue;
            const rules = editRules[meta.name];
            if (!rules) continue;

            const value = values[meta.name];
            const ruleList = Array.isArray(rules) ? rules : [rules];

            for (const rule of ruleList) {
                if (rule.required && (value == null || value === '')) {
                    errors[meta.name] = `${meta.title || meta.name}不能为空`;
                    break;
                }
                if (rule.min != null && typeof value === 'number' && value < rule.min) {
                    errors[meta.name] = `${meta.title || meta.name}不能小于 ${rule.min}`;
                    break;
                }
                if (rule.max != null && typeof value === 'number' && value > rule.max) {
                    errors[meta.name] = `${meta.title || meta.name}不能大于 ${rule.max}`;
                    break;
                }
                if (rule.pattern && typeof value === 'string' && !new RegExp(rule.pattern).test(value)) {
                    errors[meta.name] = rule.message || `${meta.title || meta.name}格式不正确`;
                    break;
                }
            }
        }

        return errors;
    },
} satisfies AbilityDefinition;
