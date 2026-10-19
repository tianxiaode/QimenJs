import type { PrefixSuffixDef, FieldType } from '../types';

export interface FormFieldAbilityHost {
    el: HTMLElement;
    _cssPrefix: string;
    _fieldItem: any;
    _prefixItem: any;
    _suffixItem: any;
    _clearBtnItem: any;
    _infoItem: any;
    _initialValue: any;
    _error: string;

    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    getComponent(name: string): any;
    getNodeEl(name: string): HTMLElement | undefined;
    emit(event: string, data?: any): void;
    addCls(cls: string): void;
    removeCls(cls: string): void;
    toggleCls(cls: string, force?: boolean): void;
    setNodeText(text: string, nodeName?: string): void;
    setNodeHidden(hidden: boolean, nodeName?: string): void;
    i18nConfig(): any;

    _getFieldBody(): any;
    _getFieldEl(): HTMLElement | undefined;
    _initFieldItem(): void;
    _toggleClearBtn(): void;
    _applyRequiredConfig(): void;
    _shouldValidate(eventName: string): boolean;
    _doValidate(): Promise<void>;
    getFormValue(): any;
}
