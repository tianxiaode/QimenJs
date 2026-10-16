import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { ColumnMeta, EditType } from '../column-types';
import { Definitions } from '@/composable';
import './edit-overlay.css';

const EDIT_TYPE_INPUT_MAP: Record<EditType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text',
};

interface CellPosition {
    colName: string;
    left: number;
    top: number;
    width: number;
    height: number;
}

interface EditRule {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
}

const ICON_CHECK = `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

class EditOverlayComponent extends Component {
    static type = 'q-table-edit-overlay';

    _editableMetas: ColumnMeta[] = [];
    _cellPositions: CellPosition[] = [];
    _originalValues: Record<string, any> = {};
    _errorMessages: Record<string, string> = {};
    _editClickOff: (() => void) | null = null;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-edit-overlay',
            children: [
                { tag: 'div', name: 'editLayer', classes: 'q-edit-overlay__layer' },
                {
                    tag: 'div',
                    name: 'actions',
                    classes: 'q-edit-overlay__actions',
                    children: [
                        {
                            tag: 'button',
                            name: 'cancelBtn',
                            classes: 'q-edit-overlay__icon-btn q-edit-overlay__cancel',
                        },
                        {
                            tag: 'button',
                            name: 'saveBtn',
                            classes: 'q-edit-overlay__icon-btn q-edit-overlay__save',
                        },
                    ],
                },
                { tag: 'div', name: 'errorBar', classes: 'q-edit-overlay__error-bar' },
            ],
        };
    }

    onAfterInit(): void {
        this._buildEditors();
        this._setupIcons();
        this._positionActions();
        this._bindActions();
    }

    _setupIcons(): void {
        const saveBtn = this.getNodeEl('saveBtn');
        const cancelBtn = this.getNodeEl('cancelBtn');
        if (saveBtn) saveBtn.innerHTML = ICON_CHECK;
        if (cancelBtn) cancelBtn.innerHTML = ICON_CLOSE;
    }

    _positionActions(): void {
        const actions = this.getNodeEl('actions');
        if (!actions) return;

        const actionsLeft = this.getData('actionsLeft');
        if (actionsLeft != null) {
            actions.style.left = `${actionsLeft}px`;
            actions.style.right = '';
            actions.style.top = '0';
            actions.style.height = '100%';
        } else {
            actions.style.left = '';
            actions.style.right = '0';
            actions.style.top = '100%';
            actions.style.height = '';
            actions.style.padding = '2px 4px';
        }
    }

    _bindActions(): void {
        const saveBtn = this.getNodeEl('saveBtn');
        const cancelBtn = this.getNodeEl('cancelBtn');

        if (saveBtn) this.bind(saveBtn, 'click');
        if (cancelBtn) this.bind(cancelBtn, 'click');
        this._editClickOff = this.on('dom:click', (e: any) => this._handleActionClick(e));
    }

    _handleActionClick(e: any): void {
        const target = e?.data?.originalEvent?.target as HTMLElement | undefined;
        if (!target) return;

        const saveBtn = this.getNodeEl('saveBtn');
        const cancelBtn = this.getNodeEl('cancelBtn');

        if (target === saveBtn) {
            this._saveEdit();
            return;
        }
        if (target === cancelBtn) {
            this._cancelEdit();
            return;
        }
    }

    _saveEdit(): void {
        const values = this.getEditValues();
        const errors = this._validateValues(values);

        if (Object.keys(errors).length > 0) {
            this.showErrors(errors);
            return;
        }

        this.componentEmit('editSave', {
            rowKey: this.getData('rowKey'),
            originalValues: this.getOriginalValues(),
            newValues: values,
        });
    }

    _cancelEdit(): void {
        this.componentEmit('editCancel', {
            rowKey: this.getData('rowKey'),
            originalValues: this.getOriginalValues(),
        });
    }

    _validateValues(values: Record<string, any>): Record<string, string> {
        const errors: Record<string, string> = {};
        const editRules = this.getData('editRules') ?? {};

        for (const meta of this._editableMetas) {
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
    }

    _buildEditors(): void {
        const editLayer = this.getNodeEl('editLayer');
        if (!editLayer) return;

        const metas: ColumnMeta[] = this.getData('editableMetas') || [];
        const positions: CellPosition[] = this.getData('cellPositions') || [];
        this._editableMetas = metas;
        this._cellPositions = positions;

        for (const meta of metas) {
            const pos = positions.find(p => p.colName === meta.name);
            if (!pos) continue;

            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'q-edit-overlay__cell';
            inputWrapper.dataset.colName = meta.name;
            inputWrapper.style.left = `${pos.left}px`;
            inputWrapper.style.top = `${pos.top}px`;
            inputWrapper.style.width = `${pos.width}px`;
            inputWrapper.style.height = `${pos.height}px`;

            const input = this._createEditor(meta);
            inputWrapper.appendChild(input);

            editLayer.appendChild(inputWrapper);
        }
    }

    _createEditor(meta: ColumnMeta): HTMLElement {
        const editType = meta.editType ?? 'text';

        if (editType === 'custom' && meta.editComponent) {
            const container = document.createElement('div');
            container.className = 'q-edit-overlay__custom-editor';
            container.dataset.colName = meta.name;
            return container;
        }

        const inputType = EDIT_TYPE_INPUT_MAP[editType] || 'text';
        const input = document.createElement('input');
        input.className = 'q-edit-overlay__input';
        input.type = inputType;
        input.dataset.colName = meta.name;

        if (meta.align === 'center') {
            input.style.textAlign = 'center';
        } else if (meta.align === 'right') {
            input.style.textAlign = 'right';
        }

        return input;
    }

    activate(rowData: any): void {
        this._originalValues = {};
        this._errorMessages = {};

        for (const meta of this._editableMetas) {
            const value = rowData?.[meta.field] ?? '';
            this._originalValues[meta.name] = value;
            this._setEditorValue(meta.name, value);
        }

        this._clearErrors();
        this._focusFirstEditor();
    }

    deactivate(): void {
        this._originalValues = {};
        this._errorMessages = {};
        this._clearErrors();
    }

    getEditValues(): Record<string, any> {
        const values: Record<string, any> = {};
        for (const meta of this._editableMetas) {
            values[meta.name] = this._getEditorValue(meta.name);
        }
        return values;
    }

    getOriginalValues(): Record<string, any> {
        return { ...this._originalValues };
    }

    showErrors(errors: Record<string, string>): void {
        this._errorMessages = { ...errors };
        this._renderErrors();
    }

    _renderErrors(): void {
        const errorBar = this.getNodeEl('errorBar');
        if (!errorBar) return;

        this._clearErrors();

        const hasErrors = Object.values(this._errorMessages).some(v => v);
        if (!hasErrors) {
            errorBar.style.display = 'none';
            return;
        }

        errorBar.style.display = '';
        errorBar.innerHTML = '';

        for (const [colName, message] of Object.entries(this._errorMessages)) {
            if (!message) continue;
            const cell = this.el.querySelector(`.q-edit-overlay__cell[data-col-name="${colName}"]`);
            if (cell) cell.classList.add('q-edit-overlay__cell--error');

            const item = document.createElement('div');
            item.className = 'q-edit-overlay__error-item';
            item.textContent = message;
            errorBar.appendChild(item);
        }
    }

    _clearErrors(): void {
        const cells = this.el.querySelectorAll('.q-edit-overlay__cell');
        cells.forEach((cell: Element) => cell.classList.remove('q-edit-overlay__cell--error'));

        const errorBar = this.getNodeEl('errorBar');
        if (errorBar) {
            errorBar.innerHTML = '';
            errorBar.style.display = 'none';
        }
    }

    _setEditorValue(colName: string, value: any): void {
        const input = this._getInput(colName);
        if (input) input.value = String(value ?? '');
    }

    _getEditorValue(colName: string): any {
        const input = this._getInput(colName);
        if (!input) return undefined;
        if (input.type === 'number') {
            return input.value === '' ? null : Number(input.value);
        }
        return input.value;
    }

    _getInput(colName: string): HTMLInputElement | null {
        return this.el.querySelector(`input[data-col-name="${colName}"]`) as HTMLInputElement | null;
    }

    _focusFirstEditor(): void {
        const firstInput = this.el.querySelector('.q-edit-overlay__input') as HTMLInputElement | null;
        if (firstInput) {
            this.nextFrame(() => firstInput.focus());
        }
    }
}

const EditOverlayComponentDefs: Definitions = {
    options: {
        editableMetas: null,
        cellPositions: null,
        actionsLeft: null,
        rowKey: null,
        editRules: null,
    },
    fields: {
        _editableMetas: null,
        _cellPositions: null,
        _originalValues: null,
        _errorMessages: null,
        _editClickOff: null,
    },
} as const;

EditOverlayComponent.define(EditOverlayComponentDefs);

export { EditOverlayComponent };
