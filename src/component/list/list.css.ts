/**
 * List 列表组件样式 — Metro 风格
 *
 * 方角标记、紧凑布局，status 驱动颜色，markForm 驱动形状。
 */

export const listCSS = `
/* List 根元素 */
.q-list {
    display: block;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* 列表容器 */
.q-list__items {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* 列表项 */
.q-list__item {
    display: flex;
    align-items: flex-start;
    padding: 8px 0;
    box-sizing: border-box;
}

/* 标记容器 */
.q-list__mark {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin-top: 3px;
    position: relative;
    box-sizing: border-box;
}

/* === 标记形状 === */

.q-list__mark--dot::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 12px;
    border-radius: 0;
    background: var(--q-colors-border, #dcdfe6);
}

.q-list__mark--dash::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 0;
    width: 12px;
    height: 4px;
    border-radius: 0;
    background: var(--q-colors-border, #dcdfe6);
}

.q-list__mark--ring::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 12px;
    border-radius: 0;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: none;
}

/* === 内容 === */

.q-list__content {
    flex: 1;
    padding-left: 12px;
    min-width: 0;
}

.q-list__label {
    color: var(--q-colors-text, #1a1a1a);
}

.q-list__desc {
    font-size: 13px;
    color: var(--q-colors-text-secondary, #666);
    margin-top: 2px;
}

/* === 状态颜色 === */

.q-list__item--primary .q-list__mark--dot::before {
    background: var(--q-colors-primary, #0078d4);
}
.q-list__item--primary .q-list__mark--dash::before {
    background: var(--q-colors-primary, #0078d4);
}
.q-list__item--primary .q-list__mark--ring::before {
    border-color: var(--q-colors-primary, #0078d4);
}

.q-list__item--success .q-list__mark--dot::before {
    background: var(--q-colors-success, #107c10);
}
.q-list__item--success .q-list__mark--dash::before {
    background: var(--q-colors-success, #107c10);
}
.q-list__item--success .q-list__mark--ring::before {
    border-color: var(--q-colors-success, #107c10);
}

.q-list__item--warning .q-list__mark--dot::before {
    background: var(--q-colors-warning, #ca5010);
}
.q-list__item--warning .q-list__mark--dash::before {
    background: var(--q-colors-warning, #ca5010);
}
.q-list__item--warning .q-list__mark--ring::before {
    border-color: var(--q-colors-warning, #ca5010);
}

.q-list__item--error .q-list__mark--dot::before {
    background: var(--q-colors-error, #d13438);
}
.q-list__item--error .q-list__mark--dash::before {
    background: var(--q-colors-error, #d13438);
}
.q-list__item--error .q-list__mark--ring::before {
    border-color: var(--q-colors-error, #d13438);
}
`;
