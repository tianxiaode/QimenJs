import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnDef, EditType } from '../column-types';
import { Definitions } from '@/composable';

const EDIT_TYPE_INPUT_MAP: Record<EditType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text',
};

class EditOverlayComponent extends Component {
    static type = 'q-table-edit-overlay';

    _activeColName: string | null = null;

    get tpl(): any {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-edit-overlay',
        };
    }

    onAfterInit(): void {
        this._createSlots();
        this._createActions();
        this._createError();
        this._hideAllSlots();
    }

    _createSlots(): void {
        const columns: ColumnDefOrGroup[] = this.getData('columns') || [];
        for (const col of columns) {
            if (this._isGroup(col)) continue;
            const def = col as ColumnDef;
            if (!def.editable) continue;

            const slot = document.createElement('div');
            slot.className = 'q-edit-overlay__slot';
            slot.style.display = 'none';
            slot.dataset.colName = def.name;

            const input = this._createInput(def);
            slot.appendChild(input);

            this.el.appendChild(slot);
        }
    }

    _createInput(def: ColumnDef): HTMLElement {
        const inputType = EDIT_TYPE_INPUT_MAP[def.editType ?? 'text'] || 'text';
        const input = document.createElement('input');
        input.className = 'q-edit-overlay__input';
        input.type = inputType;
        input.dataset.colName = def.name;
        return input;
    }

    _createActions(): void {
        const actions = document.createElement('div');
        actions.className = 'q-edit-overlay__actions';

        const save = document.createElement('span');
        save.className = 'q-edit-overlay__save';
        actions.appendChild(save);

        const cancel = document.createElement('span');
        cancel.className = 'q-edit-overlay__cancel';
        actions.appendChild(cancel);

        this.el.appendChild(actions);
    }

    _createError(): void {
        const error = document.createElement('div');
        error.className = 'q-edit-overlay__error';
        error.style.display = 'none';
        this.el.appendChild(error);
    }

    activate(colName: string, value?: any): void {
        this._activeColName = colName;
        this._hideAllSlots();
        this._showSlot(colName);
        this._clearError();
        this._setValue(colName, value);
        this._focusInput(colName);
    }

    deactivate(): void {
        this._activeColName = null;
        this._hideAllSlots();
        this._clearError();
    }

    getEditValue(): any {
        if (!this._activeColName) return undefined;
        const input = this._getInput(this._activeColName);
        return input ? input.value : undefined;
    }

    showError(message: string): void {
        const error = this.el.querySelector('.q-edit-overlay__error');
        if (error) {
            error.textContent = message;
            (error as HTMLElement).style.display = '';
        }
    }

    _hideAllSlots(): void {
        const slots = this.el.querySelectorAll('.q-edit-overlay__slot');
        slots.forEach((slot: Element) => {
            (slot as HTMLElement).style.display = 'none';
        });
    }

    _showSlot(colName: string): void {
        const slot = this.el.querySelector(`.q-edit-overlay__slot[data-col-name="${colName}"]`);
        if (slot) (slot as HTMLElement).style.display = '';
    }

    _clearError(): void {
        const error = this.el.querySelector('.q-edit-overlay__error');
        if (error) {
            error.textContent = '';
            (error as HTMLElement).style.display = 'none';
        }
    }

    _setValue(colName: string, value?: any): void {
        const input = this._getInput(colName);
        if (input && value !== undefined) {
            input.value = String(value);
        }
    }

    _focusInput(colName: string): void {
        const input = this._getInput(colName);
        if (input) {
            this.nextFrame(() => input.focus());
        }
    }

    _getInput(colName: string): HTMLInputElement | null {
        return this.el.querySelector(`input[data-col-name="${colName}"]`) as HTMLInputElement | null;
    }

    _isGroup(col: ColumnDefOrGroup): boolean {
        return 'children' in col && Array.isArray((col as any).children);
    }
}

const EditOverlayComponentDefs: Definitions = {
    options: {
        columns: null,
    },
    fields: {
        _activeColName: null,
    },
} as const;

EditOverlayComponent.define(EditOverlayComponentDefs);

export { EditOverlayComponent };
