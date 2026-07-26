/**
 * Toolbar + EntityToolbar 样式 — Metro 风格
 *
 * BEM 命名：q-toolbar / q-entity-toolbar 为主块
 * 按钮图标通过 CSS class 定义，用户可覆盖 q-toolbar-btn-xxx 或传入自定义 iconCls
 */

export const toolbarCSS = `
/* ═══ Toolbar 基础（空容器）═══ */
.q-toolbar {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: var(--q-colors-bg, #fff);
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
    box-sizing: border-box;
}

.q-toolbar__items {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

.q-toolbar.q-itemgroup--vertical,
.q-toolbar .q-itemgroup--vertical {
    flex-direction: column;
}

.q-toolbar.q-collapsed .q-button__text,
.q-toolbar.q-collapsed .q-text {
    display: none;
}

.q-toolbar.q-flex-col.q-collapsed {
    width: fit-content;
}

/* ═══ EntityToolbar ═══ */
.q-entity-toolbar {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: var(--q-colors-bg, #fff);
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
    box-sizing: border-box;
}

.q-entity-toolbar__items {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

.q-entity-toolbar.q-itemgroup--vertical,
.q-entity-toolbar .q-itemgroup--vertical {
    flex-direction: column;
}

/* ═══ EntityToolbar 按钮 ═══ */
.q-entity-toolbar__btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
}

.q-entity-toolbar__btn--first-page,
.q-entity-toolbar__btn--prev-page,
.q-entity-toolbar__btn--next-page,
.q-entity-toolbar__btn--last-page {
    min-width: 28px;
    padding: 0 6px;
}

/* ═══ EntityToolbar 输入框 ═══ */
.q-entity-toolbar__input {
    width: auto;
    min-width: 60px;
    height: 32px;
}

.q-entity-toolbar__input--page-num {
    width: 60px;
    text-align: center;
}

.q-entity-toolbar__input--search {
    width: 160px;
    min-width: 120px;
}

/* ═══ EntityToolbar 下拉选择 ═══ */
.q-entity-toolbar__select {
    width: auto;
    min-width: 70px;
    height: 32px;
}

.q-entity-toolbar__select--page-size {
    min-width: 70px;
}

/* ═══ EntityToolbar 文本 ═══ */
.q-entity-toolbar__text {
    font-size: 13px;
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
    padding: 0 4px;
}

.q-entity-toolbar__text--page-total {
    min-width: 48px;
    text-align: center;
}

.q-entity-toolbar__text--total-records {
    min-width: 36px;
}

/* ═══ 分组分隔 ═══ */
.q-entity-toolbar__btn--search,
.q-entity-toolbar__input--search {
    margin-left: 8px;
}

.q-entity-toolbar__btn--create {
    margin-left: 8px;
}

/* ═══ 按钮图标 — 默认 ::before 伪元素 ═══ */
.q-toolbar-btn-first-page::before { content: '⏫'; }
.q-toolbar-btn-prev-page::before  { content: '◀'; }
.q-toolbar-btn-next-page::before  { content: '▶'; }
.q-toolbar-btn-last-page::before  { content: '⏬'; }
.q-toolbar-btn-search::before     { content: '🔍'; }

.q-toolbar-btn-create::before  { content: '+'; }
.q-toolbar-btn-edit::before    { content: '✎'; }
.q-toolbar-btn-delete::before  { content: '✕'; }
.q-toolbar-btn-refresh::before { content: '↻'; }
.q-toolbar-btn-save::before    { content: '💾'; }
.q-toolbar-btn-import::before  { content: '↓'; }
.q-toolbar-btn-export::before  { content: '↑'; }
.q-toolbar-btn-upload::before  { content: '⇧'; }
.q-toolbar-btn-download::before{ content: '⇩'; }
.q-toolbar-btn-history::before { content: '🕐'; }
.q-toolbar-btn-help::before    { content: '?'; }

/* ═══ 按钮图标基础样式 ═══ */
.q-button__icon[class*="q-toolbar-btn-"] {
    font-style: normal;
    font-size: 16px;
    line-height: 1;
    speak: never;
}

/* ═══ 禁用状态 ═══ */
.q-entity-toolbar__btn.q-button--disabled,
.q-entity-toolbar__input.q-input--disabled,
.q-entity-toolbar__select.q-select--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
}
`;
