/**
 * Indicator 指示器样式
 *
 * 三种类型：dot(圆点) / number(数字) / dash(横线)
 * active 项通过 CSS 类标记，视觉区分明确。
 */

export const indicatorCSS = `
/* Indicator 根元素 */
.q-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.q-indicator__items {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* ── 通用项 ── */
.q-indicator__item {
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
}

/* ── 圆点模式 ── */
.q-indicator--dot .q-indicator__item {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--q-colors-border, #dcdfe6);
}

.q-indicator--dot .q-indicator__item--active {
    background: var(--q-colors-primary, #0078d4);
    width: 10px;
    height: 10px;
}

.q-indicator--dot .q-indicator__item:hover:not(.q-indicator__item--active) {
    background: var(--q-colors-text-secondary, #999);
}

/* ── 数字模式 ── */
.q-indicator--number .q-indicator__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--q-colors-text-secondary, #666);
    background: transparent;
}

.q-indicator--number .q-indicator__item--active {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
    color: #fff;
}

.q-indicator--number .q-indicator__item:hover:not(.q-indicator__item--active) {
    border-color: var(--q-colors-text-secondary, #666);
}

/* ── 横线模式 ── */
.q-indicator--dash .q-indicator__item {
    width: 16px;
    height: 4px;
    background: var(--q-colors-border, #dcdfe6);
    border-radius: 0;
}

.q-indicator--dash .q-indicator__item--active {
    width: 28px;
    background: var(--q-colors-primary, #0078d4);
}

.q-indicator--dash .q-indicator__item:hover:not(.q-indicator__item--active) {
    background: var(--q-colors-text-secondary, #999);
}
`;
