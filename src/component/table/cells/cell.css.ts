/**
 * Cell 单元格共享样式 — Metro 风格
 *
 * 所有单元格共享的基础样式，各子类通过修饰类扩展。
 */

export const cellCSS = `
/* Cell 基础 */
.q-cell {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
}

/* 对齐修饰 */
.q-cell--left   { justify-content: flex-start; text-align: left; }
.q-cell--center { justify-content: center;     text-align: center; }
.q-cell--right  { justify-content: flex-end;    text-align: right; }

/* 文本内容 */
.q-cell__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ─── TreeCell ─── */
.q-cell__tree {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
}

.q-cell__toggle {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--q-colors-text-secondary, #666);
    transition: transform 0.15s;
}

.q-cell__toggle::before {
    content: '▶';
}

.q-cell__toggle--expanded {
    transform: rotate(90deg);
}

.q-cell__toggle--leaf {
    visibility: hidden;
    cursor: default;
}

/* ─── CheckboxCell ─── */
.q-cell__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
}

.q-cell__checkbox--checked {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
}

.q-cell__checkbox--checked::after {
    content: '✓';
    color: var(--q-colors-on-primary, #fff);
    font-size: 12px;
    font-weight: 700;
}

.q-cell__checkbox--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* ─── ActionCell ─── */
.q-cell__actions {
    display: flex;
    align-items: center;
    gap: 4px;
}
`;
