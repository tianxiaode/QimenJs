import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import type { ColumnMeta } from '../column-types';
import { EditOverlayComponent } from '../edit-overlay/EditOverlayComponent';

/**
 * TableEditAbility — 表格行编辑能力
 *
 * 双击行触发编辑：创建 EditOverlayComponent 浮动层覆盖在行上方，
 * 显示该行所有 editable 列的编辑器，底部统一操作栏（取消 + 保存）。
 *
 * 关键设计：
 * - 浮动层模式：不破坏行 DOM 结构，编辑器溢出单元格边界不受限
 * - 只有一对取消/保存按钮：底部固定操作栏，多列编辑时统一操作
 * - 必须点取消按钮关闭：不响应点击外部/Escape，避免误触丢失数据
 * - 验证错误：浮动层内错误区域 + 字段标红
 *
 * 通过 TableComponent option editTrigger 配置触发方式：
 * - 'dblclick'（默认）：双击行进入编辑
 * - 'click'：单击行进入编辑
 */
export const TableEditAbility = {
    _editOverlay: null as EditOverlayComponent | null,
    _editingRowKey: null as string | null,
    _editingRowData: null as any | null,

    _initEdit(this: TableAbilityHost): void {
        const trigger = this.getData('editTrigger') ?? 'dblclick';
        const eventName = trigger === 'click' ? 'click' : 'dblclick';

        this.domEvents = {
            ...(this.domEvents || {}),
            [eventName]: [
                ...(this.domEvents?.[eventName] || []),
                { path: '[items]', handler: '_onRowEditTrigger' },
            ],
        };
    },

    _onRowEditTrigger(this: TableAbilityHost, domEvt: any): void {
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

        this._editOverlay = new EditOverlayComponent({
            editableMetas,
        });

        this._editOverlay.activate(rowData, editableMetas);

        const anchorEl = row.el;
        this._editOverlay._showOverlay({
            anchor: anchorEl,
            placement: 'bottom',
        });

        this._bindEditActions();
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
        this._editOverlay._hideOverlay();
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
