import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { ColumnMeta } from '../column-types';
import type { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { NumberInputComponent } from '@/component/form/NumberInputComponent';
import { SelectComponent, type SelectOption } from '@/component/form/SelectComponent';
import { DatePickerComponent } from '@/component/form/DatePickerComponent';
import './edit-overlay.css';

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

interface EditorEntry {
    kind: 'native' | 'framework';
    input?: HTMLInputElement;
    component?: any;
}

const ICON_CHECK = `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

class EditOverlayComponent extends Component {
    static type = 'q-table-edit-overlay';

    _editableMetas: ColumnMeta[] = [];
    _cellPositions: CellPosition[] = [];
    _originalValues: Record<string, any> = {};
    _errorMessages: Record<string, string> = {};
    _rowData: Record<string, any> | null = null;
    _pendingNewValues: Record<string, any> | null = null;
    _editors: Map<string, EditorEntry> = new Map();

    domEvents: DomEventsMap = {
        click: [
            { path: 'saveBtn', handler: '_onSaveClick', entities: 'update', bridges: ['editSave'], condition: '_canForwardSave' },
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

    _canForwardSave(): boolean {
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
            const cell = this.el?.querySelector(`.q-edit-overlay__cell[data-col-name="${colName}"]`);
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
