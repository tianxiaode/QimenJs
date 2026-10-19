import type { AbilityDefinition } from '@/composable';
import type { FormFieldAbilityHost } from './types';
import type { PrefixSuffixDef, FieldType } from '../types';
import { InputFieldComponent } from '../InputFieldComponent';
import { TextareaFieldComponent } from '../TextareaFieldComponent';
import { IconComponent } from '../../icon/IconComponent';
import { TextComponent } from '../../text/TextComponent';
import {
    PREFIX_ORDER,
    FIELD_ITEM_ORDER,
    SUFFIX_ORDER,
    CLEAR_BTN_ORDER,
} from '../constants';

export const FieldItemAbility = {
    _onPrefixOptionChange(this: FormFieldAbilityHost, value: PrefixSuffixDef | null): void {
        this._unmountPrefix();
        if (value) this._mountPrefix(value);
    },

    _onSuffixOptionChange(this: FormFieldAbilityHost, value: PrefixSuffixDef | null): void {
        this._unmountSuffix();
        if (value) this._mountSuffix(value);
    },

    _onClearableOptionChange(this: FormFieldAbilityHost, value: boolean): void {
        if (value) {
            this._initClearBtn();
            this._toggleClearBtn();
        } else {
            this._removeClearBtn();
        }
    },

    _initFieldItem(this: FormFieldAbilityHost): void {
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

    _getFieldBody(this: FormFieldAbilityHost): any {
        return this.getComponent('fieldBody') as any;
    },

    _getFieldEl(this: FormFieldAbilityHost): HTMLElement | undefined {
        return this._fieldItem?.el as HTMLElement | undefined;
    },

    _mountPrefix(this: FormFieldAbilityHost, value: PrefixSuffixDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const isIcon = typeof value === 'object' && value !== null && 'iconCls' in value;
        const item = fieldBodyCmp.add({
            type: isIcon ? IconComponent : TextComponent,
            ...(isIcon ? { iconCls: value.iconCls } : { text: value as string }),
            order: PREFIX_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__prefix');
        }
        this._prefixItem = item;
    },

    _unmountPrefix(this: FormFieldAbilityHost): void {
        if (!this._prefixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._prefixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._prefixItem = null;
    },

    _mountSuffix(this: FormFieldAbilityHost, value: PrefixSuffixDef): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const isIcon = typeof value === 'object' && value !== null && 'iconCls' in value;
        const item = fieldBodyCmp.add({
            type: isIcon ? IconComponent : TextComponent,
            ...(isIcon ? { iconCls: value.iconCls } : { text: value as string }),
            order: SUFFIX_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__suffix');
        }
        this._suffixItem = item;
    },

    _unmountSuffix(this: FormFieldAbilityHost): void {
        if (!this._suffixItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._suffixItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._suffixItem = null;
    },

    _initClearBtn(this: FormFieldAbilityHost): void {
        if (this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp) return;
        const item = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: 'q-close',
            order: CLEAR_BTN_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__clear-btn');
            item.el.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                this.onClearBtnClick();
            });
        }
        this._clearBtnItem = item;
    },

    _removeClearBtn(this: FormFieldAbilityHost): void {
        if (!this._clearBtnItem) return;
        const fieldBodyCmp = this._getFieldBody();
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._clearBtnItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._clearBtnItem = null;
    },

    onClearBtnClick(this: FormFieldAbilityHost): void {
        this._toggleClearBtn();
        this._fieldItem?.focus();
    },

    _toggleClearBtn(this: FormFieldAbilityHost): void {
        if (!this._clearBtnItem) return;
        const hasValue = !!this._fieldItem?.value;
        this._clearBtnItem.el.classList.toggle('hidden', !hasValue);
    },
} satisfies AbilityDefinition;
