/**
 * Tabs 标签页样式 — Metro 风格
 *
 * 包含三部分：
 * 1. Tab（单个标签）
 * 2. TabBar（标签栏）
 * 3. Tabs（标签页容器，4 位置布局）
 */

export const tabsCSS = `
/* =========================================
   Tab 单个标签
   ========================================= */
.q-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    font-size: 14px;
    font-weight: 400;
    color: var(--q-colors-text, #333);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.q-tab:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

.q-tab--pressed {
    border-bottom-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
    font-weight: 600;
}

.q-tab--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.q-tab__icon {
    font-size: 16px;
}

.q-tab__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 14px;
    line-height: 1;
    color: var(--q-colors-text-secondary, #666);
    border-radius: 0;
    transition: color 0.15s, background 0.15s;
}

.q-tab__close:hover {
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.15));
}

/* =========================================
   TabBar 标签栏
   ========================================= */
.q-tab-bar {
    display: flex;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-tab-bar__items {
    display: flex;
    align-items: stretch;
    gap: 0;
}

/* 位置：top（默认） */
.q-tab-bar--top {
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
}

/* 位置：bottom */
.q-tab-bar--bottom {
    border-bottom: none;
    border-top: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-tab-bar--bottom .q-tab {
    border-bottom: none;
    border-top: 2px solid transparent;
    margin-bottom: 0;
    margin-top: -2px;
}

.q-tab-bar--bottom .q-tab--pressed {
    border-top-color: var(--q-colors-primary, #0078d4);
}

/* 位置：left（垂直） */
.q-tab-bar--left {
    flex-direction: column;
    border-bottom: none;
    border-right: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-tab-bar--left .q-tab {
    border-bottom: none;
    border-right: 2px solid transparent;
    margin-bottom: 0;
    margin-right: -2px;
    justify-content: flex-start;
}

.q-tab-bar--left .q-tab--pressed {
    border-right-color: var(--q-colors-primary, #0078d4);
}

/* 位置：right（垂直） */
.q-tab-bar--right {
    flex-direction: column;
    border-bottom: none;
    border-left: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-tab-bar--right .q-tab {
    border-bottom: none;
    border-left: 2px solid transparent;
    margin-bottom: 0;
    margin-left: -2px;
    justify-content: flex-start;
}

.q-tab-bar--right .q-tab--pressed {
    border-left-color: var(--q-colors-primary, #0078d4);
}

/* =========================================
   Tabs 标签页容器
   ========================================= */
.q-tabs {
    display: flex;
    box-sizing: border-box;
    width: 100%;
}

.q-tabs__bar {
    display: flex;
    flex-shrink: 0;
}

.q-tabs__content {
    flex: 1;
    padding: 12px 0;
    overflow: auto;
}

.q-tabs__pane {
    display: block;
}

.q-tabs__pane--disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* 位置：top（默认） */
.q-tabs--top {
    flex-direction: column;
}

/* 位置：bottom */
.q-tabs--bottom {
    flex-direction: column-reverse;
}

.q-tabs--bottom .q-tabs__content {
    padding: 0 0 12px 0;
}

/* 位置：left */
.q-tabs--left {
    flex-direction: row;
}

.q-tabs--left .q-tabs__bar {
    min-width: 120px;
}

.q-tabs--left .q-tabs__content {
    padding: 0 0 0 16px;
}

/* 位置：right */
.q-tabs--right {
    flex-direction: row-reverse;
}

.q-tabs--right .q-tabs__bar {
    min-width: 120px;
}

.q-tabs--right .q-tabs__content {
    padding: 0 16px 0 0;
}
`;