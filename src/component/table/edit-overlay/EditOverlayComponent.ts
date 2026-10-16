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

class EditOverlayComponent extends Component {
    static type = 'q-table-edit-overlay';

    _editableMetas: ColumnMeta[] = [];
    _cellPositions: CellPosition[] = [];
    _originalValues: Record<string, any> = {};
    _errorMessages: Record<string, string> = {};

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
                            classes: 'q-edit-overlay__btn q-edit-overlay__cancel',
                        },
                        {
                            tag: 'button',
                            name: 'saveBtn',
                            classes: 'q-edit-overlay__btn q-edit-overlay__save',
                        },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        this._buildEditors();
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
        for (const [colName, message] of Object.entries(this._errorMessages)) {
            const cell = this.el.querySelector(`.q-edit-overlay__cell[data-col-name="${colName}"]`);
            if (cell) {
                if (message) {
                    cell.classList.add('q-edit-overlay__cell--error');
                    const errorTip = document.createElement('div');
                    errorTip.className = 'q-edit-overlay__error-tip';
                    errorTip.textContent = message;
                    cell.appendChild(errorTip);
                } else {
                    cell.classList.remove('q-edit-overlay__cell--error');
                    const tip = cell.querySelector('.q-edit-overlay__error-tip');
                    if (tip) tip.remove();
                }
            }
        }
    }

    _clearErrors(): void {
        this._errorMessages = {};
        const cells = this.el.querySelectorAll('.q-edit-overlay__cell');
        cells.forEach((cell: Element) => {
            cell.classList.remove('q-edit-overlay__cell--error');
            const tip = cell.querySelector('.q-edit-overlay__error-tip');
            if (tip) tip.remove();
        });
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
    },
    fields: {
        _editableMetas: null,
        _cellPositions: null,
        _originalValues: null,
        _errorMessages: null,
    },
} as const;

EditOverlayComponent.define(EditOverlayComponentDefs);

export { EditOverlayComponent };
