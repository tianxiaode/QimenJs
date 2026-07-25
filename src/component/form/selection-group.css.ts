/**
 * CheckboxGroup / RadioGroup 选择组样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件定义 CheckboxGroup 和 RadioGroup 共有的样式：
 * - 选项布局（vertical/horizontal）
 * - 选项项样式
 * - 选中/禁用/错误状态
 * - 尺寸变体
 */

export const selectionGroupCSS = `
/* ═══════════════════════════════════════════════════
 * CheckboxGroup
 * ═══════════════════════════════════════════════════ */

.q-checkbox-group__wrapper {
    display: flex;
    align-items: flex-start;
}

.q-checkbox-group__options .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.q-checkbox-group__options .q-itemgroup__items > * {
    display: inline-flex;
}

.q-checkbox-group__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    user-select: none;
}

.q-checkbox-group__box {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    transition: border-color 0.15s, background 0.15s;
}

.q-checkbox-group__box--checked {
    border-color: var(--q-colors-primary, #0078d4);
    background: var(--q-colors-primary, #0078d4);
}

.q-checkbox-group__box--checked::after {
    content: '';
    display: block;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
}

.q-checkbox-group__item--checked {
    color: var(--q-colors-primary, #0078d4);
}

.q-checkbox-group__item--disabled {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-checkbox-group__item--disabled .q-checkbox-group__box {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
}

.q-checkbox-group__item--disabled .q-checkbox-group__box--checked {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.4));
    border-color: var(--q-colors-primary-light, rgba(0, 120, 212, 0.4));
}

.q-checkbox-group--disabled .q-checkbox-group__item {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-checkbox-group--error .q-checkbox-group__box {
    border-color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * RadioGroup
 * ═══════════════════════════════════════════════════ */

.q-radio-group__wrapper {
    display: flex;
    align-items: flex-start;
}

.q-radio-group__options .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.q-radio-group__options .q-itemgroup__items > * {
    display: inline-flex;
}

.q-radio-group__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    user-select: none;
}

.q-radio-group__dot {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 50%;
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    transition: border-color 0.15s;
}

.q-radio-group__dot--checked {
    border-color: var(--q-colors-primary, #0078d4);
}

.q-radio-group__dot--checked::after {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--q-colors-primary, #0078d4);
}

.q-radio-group__item--checked {
    color: var(--q-colors-primary, #0078d4);
}

.q-radio-group__item--disabled {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-radio-group__item--disabled .q-radio-group__dot {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
}

.q-radio-group__item--disabled .q-radio-group__dot--checked::after {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.4));
}

.q-radio-group--disabled .q-radio-group__item {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-radio-group--error .q-radio-group__dot {
    border-color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-checkbox-group--sm .q-checkbox-group__item,
.q-radio-group--sm .q-radio-group__item {
    font-size: 12px;
}

.q-checkbox-group--sm .q-checkbox-group__box,
.q-radio-group--sm .q-radio-group__dot {
    width: 14px;
    height: 14px;
}

.q-checkbox-group--sm .q-checkbox-group__box--checked::after {
    width: 4px;
    height: 7px;
}

.q-radio-group--sm .q-radio-group__dot--checked::after {
    width: 6px;
    height: 6px;
}

.q-checkbox-group--lg .q-checkbox-group__item,
.q-radio-group--lg .q-radio-group__item {
    font-size: 16px;
}

.q-checkbox-group--lg .q-checkbox-group__box,
.q-radio-group--lg .q-radio-group__dot {
    width: 22px;
    height: 22px;
}

.q-checkbox-group--lg .q-checkbox-group__box--checked::after {
    width: 6px;
    height: 11px;
}

.q-radio-group--lg .q-radio-group__dot--checked::after {
    width: 10px;
    height: 10px;
}
`;
