import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { ColumnMeta, EditType } from '../column-types';
import type { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { ValidationErrorBuilder, ValidationErrorCode } from '@/validation';
import { t } from '@/i18n';
import './edit-overlay.css';

const EDIT_TYPE_TO_COMPONENT: Record<Exclude<EditType, 'text' | 'custom'>, string> = {
    number: 'number-input',
    select: 'select',
    date: 'date-picker',
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
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
}

interface EditorEntry {
    kind: 'native' | 'framework';
    input?: HTMLInputElement;
    component?: any;
}

class EditOverlayComponent extends Component {
    static type = 'table-edit-overlay';

    _editableMetas: ColumnMeta[] = [];
    _cellPositions: CellPosition[] = [];
    _originalValues: Record<string, any> = {};
    _errorMessages: Record<string, string> = {};
    _rowData: Record<string, any> | null = null;
    _pendingNewValues: Record<string, any> | null = null;
    _editors: Map<string, EditorEntry> = new Map();

    domEvents: DomEventsMap = {
        click: [
            { path: 'saveBtn', handler: '_onSaveClick', entities: 'update', bridges: ['editSave'] },
            { path: 'cancelBtn', handler: '_onCancelClick', bridges: ['editCancel'] },
        ],
    };

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

    get defaultEventData(): Record<string, any> {
        if (!this._pendingNewValues || !this._rowData) return {};
        return {
            ...this._rowData,
            ...this._pendingNewValues,
        };
    }

    onAfterInit(): void {
        this._buildEditors();
        this._setupIcons();
        this._positionActions();
    }

    onBeforeDispose(): void {
        this._disposeEditors();
    }

    _setupIcons(): void {
        const saveBtn = this.getNodeEl('saveBtn');
        const cancelBtn = this.getNodeEl('cancelBtn');
        if (saveBtn) saveBtn.innerHTML = '<i class="q-icon q-icon-check"></i>';
        if (cancelBtn) cancelBtn.innerHTML = '<i class="q-icon q-icon-close"></i>';
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

    _onSaveClick(): void {
        const values = this.getEditValues();
        const errors = this._validateValues(values);

        if (Object.keys(errors).length > 0) {
            this._pendingNewValues = null;
            this.showErrors(errors);
            return;
        }

        this._pendingNewValues = values;
    }

    beforeForwardEntity(): boolean {
        return this._pendingNewValues !== null;
    }

    beforeForwardBridge(): boolean {
        return this._pendingNewValues !== null;
    }

    _onCancelClick(): void {
        this._pendingNewValues = null;
    }

    _validateValues(values: Record<string, any>): Record<string, string> {
        const errors: Record<string, string> = {};
        const editRules = this.getData('editRules') ?? {};

        for (const meta of this._editableMetas) {
            const rules = editRules[meta.name];
            if (!rules) continue;

            const value = values[meta.name];
            const ruleList = Array.isArray(rules) ? rules : [rules];
            const editType = meta.editType ?? 'text';
            const ctx = { field: meta.name, label: meta.title || meta.name, value };

            for (const rule of ruleList) {
                if (rule.required && (value == null || value === '')) {
                    const err = ValidationErrorBuilder.required(ctx);
                    errors[meta.name] = t(err.code, true);
                    break;
                }
                if (rule.min != null && typeof value === 'number' && value < rule.min) {
                    const err = ValidationErrorBuilder.too_small(rule.min, value, false, ctx);
                    errors[meta.name] = t(err.code, true);
                    break;
                }
                if (rule.max != null && typeof value === 'number' && value > rule.max) {
                    const err = ValidationErrorBuilder.too_large(rule.max, value, false, ctx);
                    errors[meta.name] = t(err.code, true);
                    break;
                }
                if (
                    rule.pattern &&
                    typeof value === 'string' &&
                    !new RegExp(rule.pattern).test(value)
                ) {
                    const err = ValidationErrorBuilder.pattern_mismatch(rule.pattern, value, ctx);
                    errors[meta.name] = rule.message || t(err.code, true);
                    break;
                }
                if (rule.minLength != null && typeof value === 'string' && value.length < rule.minLength) {
                    const err = ValidationErrorBuilder.too_small(rule.minLength, value.length, false, ctx);
                    errors[meta.name] = t(err.code, true);
                    break;
                }
                if (rule.maxLength != null && typeof value === 'string' && value.length > rule.maxLength) {
                    const err = ValidationErrorBuilder.too_large(rule.maxLength, value.length, false, ctx);
                    errors[meta.name] = t(err.code, true);
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

            const cellWrapper = document.createElement('div');
            cellWrapper.className = 'q-edit-overlay__cell';
            cellWrapper.dataset.colName = meta.name;
            cellWrapper.style.left = `${pos.left}px`;
            cellWrapper.style.top = `${pos.top}px`;
            cellWrapper.style.width = `${pos.width}px`;
            cellWrapper.style.height = `${pos.height}px`;

            this._createEditor(meta, cellWrapper);
            editLayer.appendChild(cellWrapper);
        }
    }

    _createEditor(meta: ColumnMeta, cellWrapper: HTMLElement): void {
        const editType = meta.editType ?? 'text';
        const editOptions = meta.editOptions ?? {};

        if (editType === 'text') {
            this._createNativeInput(meta, cellWrapper);
            return;
        }

        const componentType = editType === 'custom'
            ? meta.editComponent
            : EDIT_TYPE_TO_COMPONENT[editType as Exclude<EditType, 'text' | 'custom'>];

        if (!componentType) return;

        const Ctor = this.resolveComponent(componentType);
        if (!Ctor) return;

        const component = new (Ctor as any)({ ...editOptions });
        if (component.el) cellWrapper.appendChild(component.el);
        this._editors.set(meta.name, { kind: 'framework', component });
    }

    _createNativeInput(meta: ColumnMeta, cellWrapper: HTMLElement): void {
        const input = document.createElement('input');
        input.className = 'q-edit-overlay__input';
        input.type = 'text';
        input.dataset.colName = meta.name;

        if (meta.align === 'center') {
            input.style.textAlign = 'center';
        } else if (meta.align === 'right') {
            input.style.textAlign = 'right';
        }

        cellWrapper.appendChild(input);
        this._editors.set(meta.name, { kind: 'native', input });
    }

            cellWrapper.appendChild(input);
            this._editors.set(meta.name, { kind: 'native', input });
            return;
        }

        if (editType === 'number') {
            const component = new NumberInputComponent({
                controls: false,
                ...editOptions,
            });
            if (component.el) cellWrapper.appendChild(component.el);
            this._editors.set(meta.name, { kind: 'framework', component });
            return;
        }

        if (editType === 'select') {
            const component = new SelectComponent({
                options: (editOptions.options ?? []) as SelectOption[],
                ...editOptions,
            });
            if (component.el) cellWrapper.appendChild(component.el);
            this._editors.set(meta.name, { kind: 'framework', component });
            return;
        }

        if (editType === 'date') {
            const component = new DatePickerComponent({
                ...editOptions,
            });
            if (component.el) cellWrapper.appendChild(component.el);
            this._editors.set(meta.name, { kind: 'framework', component });
            return;
        }

        if (editType === 'custom' && meta.editComponent) {
            const Ctor = this.resolveComponent(meta.editComponent);
            if (Ctor) {
                const component = new (Ctor as any)({ ...editOptions });
                if (component.el) cellWrapper.appendChild(component.el);
                this._editors.set(meta.name, { kind: 'framework', component });
                return;
            }
        }

        const input = document.createElement('input');
        input.className = 'q-edit-overlay__input';
        input.type = 'text';
        input.dataset.colName = meta.name;
        cellWrapper.appendChild(input);
        this._editors.set(meta.name, { kind: 'native', input });
    }

    activate(rowData: any): void {
        this._rowData = rowData;
        this._originalValues = {};
        this._errorMessages = {};
        this._pendingNewValues = null;

        const frameworkReadyPromises: Promise<any>[] = [];

        for (const meta of this._editableMetas) {
            const value = rowData?.[meta.field] ?? '';
            this._originalValues[meta.name] = value;

            const editor = this._editors.get(meta.name);
            if (!editor) continue;

            if (editor.kind === 'native' && editor.input) {
                editor.input.value = String(value ?? '');
            } else if (editor.kind === 'framework' && editor.component) {
                const cmp = editor.component;
                frameworkReadyPromises.push(
                    Promise.resolve(cmp.ready).then(() => cmp.setFormValue(value))
                );
            }
        }

        this._clearErrors();

        if (frameworkReadyPromises.length > 0) {
            Promise.all(frameworkReadyPromises).then(() => this._focusFirstEditor());
        } else {
            this._focusFirstEditor();
        }
    }

    deactivate(): void {
        this._rowData = null;
        this._originalValues = {};
        this._errorMessages = {};
        this._pendingNewValues = null;
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
            const cell = this.el?.querySelector(
                `.q-edit-overlay__cell[data-col-name="${colName}"]`
            );
            if (cell) cell.classList.add('q-edit-overlay__cell--error');

            const item = document.createElement('div');
            item.className = 'q-edit-overlay__error-item';
            item.textContent = message;
            errorBar.appendChild(item);
        }
    }

    _clearErrors(): void {
        const cells = this.el?.querySelectorAll('.q-edit-overlay__cell');
        cells?.forEach((cell: Element) => cell.classList.remove('q-edit-overlay__cell--error'));

        const errorBar = this.getNodeEl('errorBar');
        if (errorBar) {
            errorBar.innerHTML = '';
            errorBar.style.display = 'none';
        }
    }

    _getEditorValue(colName: string): any {
        const editor = this._editors.get(colName);
        if (!editor) return undefined;

        if (editor.kind === 'native' && editor.input) {
            if (editor.input.type === 'number') {
                return editor.input.value === '' ? null : Number(editor.input.value);
            }
            return editor.input.value;
        }

        if (editor.kind === 'framework' && editor.component) {
            return editor.component.getFormValue();
        }

        return undefined;
    }

    _focusFirstEditor(): void {
        for (const meta of this._editableMetas) {
            const editor = this._editors.get(meta.name);
            if (!editor) continue;

            if (editor.kind === 'native' && editor.input) {
                this.nextFrame(() => editor.input!.focus());
                return;
            }

            if (editor.kind === 'framework' && editor.component) {
                const cmp = editor.component;
                Promise.resolve(cmp.ready).then(() => {
                    if (typeof cmp.focus === 'function') {
                        cmp.focus();
                    } else {
                        const fieldEl = cmp.getNodeEl?.('field') as HTMLInputElement | undefined;
                        fieldEl?.focus();
                    }
                });
                return;
            }
        }
    }

    _disposeEditors(): void {
        for (const [, editor] of this._editors) {
            if (editor.kind === 'framework' && editor.component) {
                if (typeof editor.component.dispose === 'function') {
                    editor.component.dispose();
                }
            }
        }
        this._editors.clear();
    }
}

const EditOverlayComponentDefs: Definitions = {
    options: {
        editableMetas: null,
        cellPositions: null,
        actionsLeft: null,
        rowKey: null,
        editRules: null,
        entityKey: null,
    },
    fields: {
        _editableMetas: null,
        _cellPositions: null,
        _originalValues: null,
        _errorMessages: null,
        _rowData: null,
        _pendingNewValues: null,
        _editors: null,
    },
} as const;

EditOverlayComponent.define(EditOverlayComponentDefs);

export { EditOverlayComponent };
