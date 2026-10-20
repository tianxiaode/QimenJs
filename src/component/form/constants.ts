export const PREFIX_ORDER = 0;
export const FIELD_ITEM_ORDER = 100;
export const SUFFIX_ORDER = 200;
export const CLEAR_BTN_ORDER = 300;
export const EYE_BTN_ORDER = 400;
export const STEP_UP_ORDER = 500;
export const STEP_DOWN_ORDER = 501;
export const STEPS_ORDER = 600;
export const DROPDOWN_ICON_ORDER = 600;

export const LABEL_POSITION_MAP: Record<string, string> = {
    top: 'q-formfield--top',
    left: 'q-formfield--left',
    right: 'q-formfield--right',
};

export const REQUIRED_ERROR_MESSAGE = '此字段为必填项';

/** number-input 允许输入的单字符（数字/小数点/正负号），keydown 拦截与 input 清理共用 */
export const NUMERIC_CHAR_PATTERN = /^[\d.+-]$/;
/** number-input value 中非法字符的清理正则（兜底粘贴/输入法） */
export const NUMERIC_VALUE_CLEAN_PATTERN = /[^\d.+-]/g;
