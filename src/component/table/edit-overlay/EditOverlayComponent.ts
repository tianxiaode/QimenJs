import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { ColumnDef, ColumnMeta, EditType } from '../column-types';
import { Definitions } from '@/composable';
import './edit-overlay.css';

const EDIT_TYPE_INPUT_MAP: Record<EditType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text',
};

class EditOverlayComponent extends Component {
    static type = 'q-table-edit-overlay';

    _activeRowData: any = null;
    _editableMetas: ColumnMeta[] = [];
    _originalValues: Record<string, any> = {};
    _errorMessages: Record<string, string> = {};

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-edit-overlay',
            children: [
                {
                    tag: 'div',
                    name: 'editArea',
                    classes: 'q-edit-overlay__edit-area',
                },
                {
                    tag: 'div',
                    name: 'errorArea',
                    classes: 'q-edit-overlay__error-area',
                },
                {
                    tag: 'div',
                    name: 'actions',
                    classes: 'q-edit-overlay__actions',
                    children: [
                        {
                            tag: 'button',
                            name: 'cancelBtn',
                            classes: 'q-edit-overlay__cancel',
                            options: { text: '取消' },
                        },
                        {
                            tag: 'button',
                            name: 'saveBtn',
                            classes: 'q-edit-overlay__save',
                            options: { text: '保存' },
                        },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        this._buildEditors();
        this._hideAllEditors();
    }

    _buildEditors(): void {
        const editArea = this.getNodeEl('editArea');
        if (!editArea) return;

        const metas: ColumnMeta[] = this.getData('editableMetas') || [];
        this._editableMetas = metas;

        for (const meta of metas) {
            const editorWrapper = document.createElement('div');
            editorWrapper.className = 'q-edit-overlay__field';
            editorWrapper.dataset.colName = meta.name;
            editorWrapper.style.display = 'none';

            const label = document.createElement('label');
            label.className = 'q-edit-overlay__field-label';
            label.textContent = meta.title || meta.name;

            const input = this._createEditor(meta);
            editorWrapper.appendChild(label);
            editorWrapper.appendChild(input);

            editArea.appendChild(editorWrapper);
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

        if (editType === 'select') {
            input.setAttribute('placeholder', '请选择...');
        }

        return input;
    }

    activate(rowData: any, editableMetas: ColumnMeta[]): void {
        this._activeRowData = rowData;
        this._editableMetas = editableMetas;
        this._originalValues = {};
        this._errorMessages = {};

        this._hideAllEditors();
        this._clearErrors();

        for (const meta of editableMetas) {
            const value = rowData?.[meta.field] ?? '';
            this._originalValues[meta.name] = value;
            this._setEditorValue(meta.name, value);
            this._showEditor(meta.name);
        }

        this._focusFirstEditor();
    }

    deactivate(): void {
        this._activeRowData = null;
        this._originalValues = {};
        this._errorMessages = {};
        this._hideAllEditors();
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
        const errorArea = this.getNodeEl('errorArea');
        if (!errorArea) return;
        errorArea.innerHTML = '';

        for (const [colName, message] of Object.entries(this._errorMessages)) {
            if (!message) continue;
            const field = this.el.querySelector(`.q-edit-overlay__field[data-col-name="${colName}"]`);
            if (field) {
                field.classList.add('q-edit-overlay__field--error');
            }
            const errorItem = document.createElement('div');
            errorItem.className = 'q-edit-overlay__error-item';
            errorItem.textContent = message;
            errorArea.appendChild(errorItem);
        }

        const hasErrors = Object.values(this._errorMessages).some(v => v);
        if (!hasErrors) {
            this._clearFieldErrors();
        }
    }

    _clearErrors(): void {
        this._errorMessages = {};
        const errorArea = this.getNodeEl('errorArea');
        if (errorArea) errorArea.innerHTML = '';
        this._clearFieldErrors();
    }

    _clearFieldErrors(): void {
        const fields = this.el.querySelectorAll('.q-edit-overlay__field');
        fields.forEach((f: Element) => f.classList.remove('q-edit-overlay__field--error'));
    }

    _hideAllEditors(): void {
        const fields = this.el.querySelectorAll('.q-edit-overlay__field');
        fields.forEach((f: Element) => {
            (f as HTMLElement).style.display = 'none';
        });
    }

    _showEditor(colName: string): void {
        const field = this.el.querySelector(`.q-edit-overlay__field[data-col-name="${colName}"]`);
        if (field) (field as HTMLElement).style.display = '';
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
    },
    fields: {
        _activeRowData: null,
        _editableMetas: null,
        _originalValues: null,
        _errorMessages: null,
    },
} as const;

EditOverlayComponent.define(EditOverlayComponentDefs);

export { EditOverlayComponent };
