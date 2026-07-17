/**
 * Header 头部组件样式 — Metro 风格
 *
 * 基础样式定义 q-header 的通用布局，
 * 不同父组件通过 CSS 层级覆盖定制样式：
 *
 * .q-dialog__header .q-header__action { }  — Dialog 的 close 按钮
 * .q-panel__header .q-header__action { }   — Panel 的 collapse 按钮
 */

export const headerCSS = `
/* Header 根元素 */
.q-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    min-height: 40px;
    box-sizing: border-box;
    user-select: none;
}

/* 图标 */
.q-header__icon {
    flex-shrink: 0;
}

/* 标题区 */
.q-header__title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--q-colors-text, #1a1a1a);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 子标题 */
.q-header__subtitle {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--q-colors-text-secondary, #666);
    margin-left: 4px;
}

/* 工具区 */
.q-header__tools {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 操作按钮 */
.q-header__action {
    flex-shrink: 0;
    margin-left: auto;
}

/* ── Dialog 场景覆盖 ── */
.q-dialog__header .q-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--q-colors-border, #dcdfe6);
    cursor: default;
}

.q-dialog__header .q-header__title {
    font-size: 16px;
}

/* ── Panel 场景覆盖 ── */
.q-panel__header .q-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--q-colors-border, #dcdfe6);
    cursor: default;
}
`;
