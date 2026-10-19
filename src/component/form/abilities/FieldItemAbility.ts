import type { AbilityDefinition } from '@/composable';
import type { ContainerItemDef } from '../../container/types';
import type { FieldType } from '../types';
import { InputFieldComponent } from '../InputFieldComponent';
import { TextareaFieldComponent } from '../TextareaFieldComponent';
import { IconComponent } from '../../icon/IconComponent';
import { PREFIX_ORDER, FIELD_ITEM_ORDER, SUFFIX_ORDER, CLEAR_BTN_ORDER } from '../constants';

export const FieldItemAbility = {
    _onPrefixOptionChange(value: ContainerItemDef | null): void {
        this._unmountPrefix();
        if (value) this._mountPrefix(value);
    },

    _onSuffixOptionChange(value: ContainerItemDef | null): void {
        this._unmountSuffix();
        if (value) this._mountSuffix(value);
    },

    _onClearableOptionChange(value: boolean): void {
        if (value) {
            this._initClearBtn();
            this._toggleClearBtn();
        } else {
            this._removeClearBtn();
        }
    },

    _initFieldItem(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp || this._fieldItem) return;

        const fieldType = this.getData('fieldType') as FieldType;
        if (fieldType === 'input') {
            fieldBodyCmp.addCls('q-input__wrapper');
            this._fieldItem = fieldBodyCmp.add({
                type: InputFieldComponent,
                order: FIELD_ITEM_ORDER,
            });
        } else if (fieldType === 'textarea') {
            fieldBodyCmp.addCls('q-textarea__wrapper');
            this._fieldItem = fieldBodyCmp.add({
                type: TextareaFieldComponent,
                order: FIELD_ITEM_ORDER,
            });
        }
    },

    _getFieldBody(): any {
        return this.getComponent('fieldBody') as any;
    },

    _getFieldEl(): HTMLElement | undefined {
        return this._fieldItem?.el as HTMLElement | undefined;
    },

    _mountPrefix(value: ContainerItemDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        this._prefixItem = fieldBodyCmp.add(value, {
            order: PREFIX_ORDER,
            cls: 'q-input__prefix',
        });
    },

    _unmountPrefix(): void {
        if (!this._prefixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._prefixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._prefixItem = null;
    },

    _mountSuffix(value: ContainerItemDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        this._suffixItem = fieldBodyCmp.add(value, {
            order: SUFFIX_ORDER,
            cls: 'q-input__suffix',
        });
    },

    _unmountSuffix(): void {
        if (!this._suffixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._suffixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._suffixItem = null;
    },

    _initClearBtn(): void {
        if (this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        this._clearBtnItem = fieldBodyCmp.add(
            { type: IconComponent, iconCls: 'q-close' },
            { order: CLEAR_BTN_ORDER, cls: 'q-input__clear-btn' }
        );
        const item = this._clearBtnItem;
        if (item?.el) {
            item.el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                this.onClearBtnClick();
            });
        }
    },

    _removeClearBtn(): void {
        if (!this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._clearBtnItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._clearBtnItem = null;
    },

    onClearBtnClick(): void {
        this._toggleClearBtn();
        this._fieldItem?.focus();
    },

    _toggleClearBtn(): void {
        if (!this._clearBtnItem) return;
        const hasValue = !!this._fieldItem?.value;
        this._clearBtnItem.el.classList.toggle('hidden', !hasValue);
    },
} satisfies AbilityDefinition;
