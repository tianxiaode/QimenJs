/**
 * Input 输入框组件样式 — Metro 风格
 *
 * 统一模板 + CSS 变量驱动布局。
 * 三封装结构：label-group / wrapper / info
 * 标签位置通过 CSS 变量 + order 控制，i18n 切换无需重建 DOM。
 * 方角、粗边框、高对比色块。
 * 支持 sm/md/lg 三种尺寸变体。
 */

export const inputCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — 布局控制（i18n 可覆盖）
 * ═══════════════════════════════════════════════════ */

.q-input {
    --q-input-direction: column;
    --q-input-label-order: 0;
    --q-input-wrapper-order: 1;
    --q-input-info-order: 2;
    --q-input-label-width: auto;
    --q-input-label-gap: 0px;
    --q-input-info-offset: 0px;
    --q-input-field-height: 36px;
    --q-input-field-padding: 0 12px;
    --q-input-field-font-size: 14px;
    --q-input-label-font-size: 14px;
    --q-input-info-font-size: 12px;
}

/* ═══════════════════════════════════════════════════
 * 根元素 — flex 布局
 * ═══════════════════════════════════════════════════ */

.q-input {
    display: flex;
    flex-direction: var(--q-input-direction);
    gap: var(--q-input-label-gap);
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
    color: var(--q-colors-text, #1a1a1a);
}

/* ═══════════════════════════════════════════════════
 * 标签位置：top — 垂直堆叠（默认）
 * ═══════════════════════════════════════════════════ */

.q-input--top {
    --q-input-direction: column;
    --q-input-label-order: 0;
    --q-input-wrapper-order: 1;
    --q-input-info-order: 2;
    --q-input-label-gap: 4px;
}

.q-input--top .q-input__label-group {
    display: block;
    margin-bottom: 0;
}

.q-input--top .q-input__label {
    display: inline;
    font-size: var(--q-input-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

/* ═══════════════════════════════════════════════════
 * 标签位置：left — 标签在左侧
 * ═══════════════════════════════════════════════════ */

.q-input--left {
    --q-input-direction: row;
    --q-input-label-order: 0;
    --q-input-wrapper-order: 1;
    --q-input-info-order: 2;
    --q-input-label-width: 80px;
    --q-input-label-gap: 12px;
    --q-input-info-offset: calc(var(--q-input-label-width) + var(--q-input-label-gap));
    align-items: flex-start;
    flex-wrap: wrap;
}

.q-input--left .q-input__label-group {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--q-input-label-width);
    padding-top: 8px;
    justify-content: flex-end;
    box-sizing: border-box;
}

.q-input--left .q-input__label {
    font-size: var(--q-input-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

.q-input--left .q-input__wrapper {
    flex: 1;
    min-width: 0;
}

.q-input--left .q-input__info {
    flex-basis: calc(100% - var(--q-input-info-offset));
    margin-left: var(--q-input-info-offset);
}

/* ═══════════════════════════════════════════════════
 * 标签位置：right — 标签在右侧
 * ═══════════════════════════════════════════════════ */

.q-input--right {
    --q-input-direction: row;
    --q-input-label-order: 2;
    --q-input-wrapper-order: 0;
    --q-input-info-order: 1;
    --q-input-label-width: 80px;
    --q-input-label-gap: 12px;
    --q-input-info-offset: 0px;
    align-items: flex-start;
    flex-wrap: wrap;
}

.q-input--right .q-input__label-group {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--q-input-label-width);
    margin-left: var(--q-input-label-gap);
    padding-top: 8px;
    justify-content: flex-start;
    box-sizing: border-box;
}

.q-input--right .q-input__label {
    font-size: var(--q-input-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

.q-input--right .q-input__wrapper {
    flex: 1;
    min-width: 0;
}

.q-input--right .q-input__info {
    flex-basis: calc(100% - var(--q-input-label-width) - var(--q-input-label-gap));
}

/* ═══════════════════════════════════════════════════
 * 标签组（label + requiredMark + separator）
 * ═══════════════════════════════════════════════════ */

.q-input__label-group {
    order: var(--q-input-label-order);
    display: inline-flex;
    align-items: center;
}

.q-input__required-mark {
    color: var(--q-colors-error, #d13438);
    font-weight: 700;
    margin-left: 4px;
}

.q-input__required-mark--before {
    order: -1;
    margin-left: 0;
    margin-right: 4px;
}

.q-input__required-mark--after {
    order: 1;
}

.q-input__separator {
    color: var(--q-colors-text-secondary, #666);
    margin-left: 4px;
}

/* ═══════════════════════════════════════════════════
 * 输入框容器 + 插槽布局
 * ═══════════════════════════════════════════════════ */

.q-input__wrapper {
    order: var(--q-input-wrapper-order);
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

.q-input__field {
    display: block;
    width: 100%;
    height: var(--q-input-field-height);
    padding: var(--q-input-field-padding);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: var(--q-input-field-font-size);
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.q-input__field::placeholder {
    color: var(--q-colors-text-placeholder, #bfbfbf);
}

.q-input__field:focus {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* 前缀（字符或 CSS 图标） */
.q-input__prefix {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 0 8px;
    height: var(--q-input-field-height);
    font-size: var(--q-input-field-font-size);
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
    box-sizing: border-box;
}

/* CSS 图标模式：通过自定义类定义 ::before content */
.q-input__prefix[class*="--icon-"]::before {
    display: inline-block;
    width: 16px;
    height: 16px;
}

/* 操作按钮区域（ItemGroupStaticComponent — clearBtn / eyeBtn 等） */
.q-input__actions {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
    z-index: 1;
}

.q-input__actions .q-itemgroup__items {
    display: flex;
    align-items: center;
    gap: 4px;
}

.q-input__actions .q-itemgroup__items > * {
    background: transparent;
}

.q-input__clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--q-colors-text-placeholder, #bfbfbf);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    border-radius: 0;
    transition: color 0.15s;
}

.q-input__clear-btn:hover {
    color: var(--q-colors-text-secondary, #666);
}

/* 插槽通用样式（suffix / dropdownIcon — 绝对定位叠加） */
.q-input__slot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    z-index: 1;
}

.q-input__slot--suffix {
    right: 40px;
}

.q-input__slot--dropdown {
    right: 72px;
}

/* ═══════════════════════════════════════════════════
 * 信息封装（InputInfoGroupComponent — error / help / 扩展信息）
 * ═══════════════════════════════════════════════════ */

.q-input__info {
    order: var(--q-input-info-order);
    box-sizing: border-box;
}

.q-input__info .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.q-input__error {
    color: var(--q-colors-error, #d13438);
    font-size: var(--q-input-info-font-size);
    line-height: 1.5;
}

.q-input__help {
    color: var(--q-colors-text-secondary, #666);
    font-size: var(--q-input-info-font-size);
    line-height: 1.5;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-input--focused .q-input__field {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

.q-input--disabled .q-input__field {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-input--disabled .q-input__label {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-input--disabled .q-input__clear-btn {
    cursor: not-allowed;
    opacity: 0.4;
}

.q-input--readonly .q-input__field {
    background: var(--q-colors-bg-readonly, #fafafa);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
    cursor: default;
}

.q-input--error .q-input__field {
    border-color: var(--q-colors-error, #d13438);
}

.q-input--error.q-input--focused .q-input__field {
    box-shadow: 0 0 0 2px var(--q-colors-error-ring, rgba(209, 52, 56, 0.2));
}

.q-input--error .q-input__label {
    color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体 — 只覆盖 CSS 变量
 * ═══════════════════════════════════════════════════ */

.q-input--sm {
    --q-input-field-height: 28px;
    --q-input-field-padding: 0 8px;
    --q-input-field-font-size: 12px;
    --q-input-label-font-size: 12px;
    --q-input-info-font-size: 11px;
}

.q-input--sm.q-input--left,
.q-input--sm.q-input--right {
    --q-input-label-width: 64px;
    --q-input-label-gap: 12px;
}

.q-input--sm .q-input__label-group {
    padding-top: 4px;
}

.q-input--md {
    --q-input-field-height: 36px;
    --q-input-field-padding: 0 12px;
    --q-input-field-font-size: 14px;
    --q-input-label-font-size: 14px;
    --q-input-info-font-size: 12px;
}

.q-input--lg {
    --q-input-field-height: 44px;
    --q-input-field-padding: 0 16px;
    --q-input-field-font-size: 16px;
    --q-input-label-font-size: 16px;
    --q-input-info-font-size: 14px;
}

.q-input--lg.q-input--left,
.q-input--lg.q-input--right {
    --q-input-label-width: 96px;
    --q-input-label-gap: 12px;
}

.q-input--lg .q-input__label-group {
    padding-top: 12px;
}
`;
