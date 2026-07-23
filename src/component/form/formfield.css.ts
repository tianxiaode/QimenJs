/**
 * FormField 表单字段基类样式 — Metro 风格
 *
 * 通用三封装布局：label-group / wrapper / info
 * 标签位置通过 CSS 变量 + order 控制。
 * labelWidth 仅在 left/right 时生效，top 时忽略。
 */

export const formfieldCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — 布局控制
 * ═══════════════════════════════════════════════════ */

.q-formfield {
    --q-formfield-direction: column;
    --q-formfield-label-order: 0;
    --q-formfield-wrapper-order: 1;
    --q-formfield-info-order: 2;
    --q-formfield-label-width: 80px;
    --q-formfield-label-gap: 0px;
    --q-formfield-info-offset: 0px;
    --q-formfield-label-font-size: 14px;
    --q-formfield-info-font-size: 12px;
}

/* ═══════════════════════════════════════════════════
 * 根元素 — flex 布局
 * ═══════════════════════════════════════════════════ */

.q-formfield {
    display: flex;
    flex-direction: var(--q-formfield-direction);
    gap: var(--q-formfield-label-gap);
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
    color: var(--q-colors-text, #1a1a1a);
}

/* ═══════════════════════════════════════════════════
 * 标签位置：top — 垂直堆叠（默认，忽略 labelWidth）
 * ═══════════════════════════════════════════════════ */

.q-formfield--top {
    --q-formfield-direction: column;
    --q-formfield-label-order: 0;
    --q-formfield-wrapper-order: 1;
    --q-formfield-info-order: 2;
    --q-formfield-label-gap: 4px;
}

.q-formfield--top .q-formfield__label-group {
    display: block;
    width: auto;
    margin-bottom: 0;
}

.q-formfield--top .q-formfield__label {
    display: inline;
    font-size: var(--q-formfield-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

/* ═══════════════════════════════════════════════════
 * 标签位置：left — 标签在左侧（labelWidth 生效）
 * ═══════════════════════════════════════════════════ */

.q-formfield--left {
    --q-formfield-direction: row;
    --q-formfield-label-order: 0;
    --q-formfield-wrapper-order: 1;
    --q-formfield-info-order: 2;
    --q-formfield-label-gap: 12px;
    --q-formfield-info-offset: calc(var(--q-formfield-label-width) + var(--q-formfield-label-gap));
    align-items: flex-start;
    flex-wrap: wrap;
}

.q-formfield--left .q-formfield__label-group {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--q-formfield-label-width);
    padding-top: 8px;
    justify-content: flex-end;
    box-sizing: border-box;
}

.q-formfield--left .q-formfield__label {
    font-size: var(--q-formfield-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

.q-formfield--left .q-formfield__wrapper {
    flex: 1;
    min-width: 0;
}

.q-formfield--left .q-formfield__info {
    flex-basis: calc(100% - var(--q-formfield-info-offset));
    margin-left: var(--q-formfield-info-offset);
}

/* ═══════════════════════════════════════════════════
 * 标签位置：right — 标签在右侧（labelWidth 生效）
 * ═══════════════════════════════════════════════════ */

.q-formfield--right {
    --q-formfield-direction: row;
    --q-formfield-label-order: 2;
    --q-formfield-wrapper-order: 0;
    --q-formfield-info-order: 1;
    --q-formfield-label-gap: 12px;
    --q-formfield-info-offset: 0px;
    align-items: flex-start;
    flex-wrap: wrap;
}

.q-formfield--right .q-formfield__label-group {
    display: inline-flex;
    flex-shrink: 0;
    width: var(--q-formfield-label-width);
    margin-left: var(--q-formfield-label-gap);
    padding-top: 8px;
    justify-content: flex-start;
    box-sizing: border-box;
}

.q-formfield--right .q-formfield__label {
    font-size: var(--q-formfield-label-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
}

.q-formfield--right .q-formfield__wrapper {
    flex: 1;
    min-width: 0;
}

.q-formfield--right .q-formfield__info {
    flex-basis: calc(100% - var(--q-formfield-label-width) - var(--q-formfield-label-gap));
}

/* ═══════════════════════════════════════════════════
 * 标签组（label + requiredMark + separator）
 * ═══════════════════════════════════════════════════ */

.q-formfield__label-group {
    order: var(--q-formfield-label-order);
    display: inline-flex;
    align-items: center;
}

.q-formfield__required-mark {
    color: var(--q-colors-error, #d13438);
    font-weight: 700;
    margin-left: 4px;
}

.q-formfield__required-mark--before {
    order: -1;
    margin-left: 0;
    margin-right: 4px;
}

.q-formfield__required-mark--after {
    order: 1;
}

.q-formfield__separator {
    color: var(--q-colors-text-secondary, #666);
    margin-left: 4px;
}

/* ═══════════════════════════════════════════════════
 * wrapper — 字段内容区
 * ═══════════════════════════════════════════════════ */

.q-formfield__wrapper {
    order: var(--q-formfield-wrapper-order);
    box-sizing: border-box;
}

/* ═══════════════════════════════════════════════════
 * 信息封装（InputInfoGroupComponent）
 * ═══════════════════════════════════════════════════ */

.q-formfield__info {
    order: var(--q-formfield-info-order);
    box-sizing: border-box;
}

.q-formfield__info .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.q-formfield__error {
    color: var(--q-colors-error, #d13438);
    font-size: var(--q-formfield-info-font-size);
    line-height: 1.5;
}

.q-formfield__help {
    color: var(--q-colors-text-secondary, #666);
    font-size: var(--q-formfield-info-font-size);
    line-height: 1.5;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-formfield--error .q-formfield__label {
    color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体 — 只覆盖 CSS 变量
 * ═══════════════════════════════════════════════════ */

.q-formfield--sm {
    --q-formfield-label-font-size: 12px;
    --q-formfield-info-font-size: 11px;
}

.q-formfield--sm.q-formfield--left,
.q-formfield--sm.q-formfield--right {
    --q-formfield-label-width: 64px;
}

.q-formfield--sm .q-formfield__label-group {
    padding-top: 4px;
}

.q-formfield--md {
    --q-formfield-label-font-size: 14px;
    --q-formfield-info-font-size: 12px;
}

.q-formfield--lg {
    --q-formfield-label-font-size: 16px;
    --q-formfield-info-font-size: 14px;
}

.q-formfield--lg.q-formfield--left,
.q-formfield--lg.q-formfield--right {
    --q-formfield-label-width: 96px;
}

.q-formfield--lg .q-formfield__label-group {
    padding-top: 12px;
}
`;
