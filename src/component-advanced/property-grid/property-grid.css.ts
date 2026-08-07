/**
 * PropertyGrid 属性网格样式 — Metro 风格
 *
 * CSS Grid 驱动，cols * 2 列（每个字段占 label + value 两列）。
 * span 控制跨列，chip 样式用于数组值，checkbox 用于布尔值。
 */

export const propertyGridCSS = `
/* PropertyGrid 根元素 */
.q-pgrid {
    display: block;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* Grid 容器 */
.q-pgrid__grid {
    display: grid;
    grid-template-columns: repeat(var(--q-pgrid-cols, 4), 1fr);
    gap: 8px 16px;
}

/* 字段行 */
.q-pgrid__field {
    display: contents;
}

/* Label */
.q-pgrid__label {
    font-weight: 600;
    color: var(--q-colors-text-secondary, #666);
    padding: 4px 0;
    box-sizing: border-box;
    word-break: break-word;
}

/* Value */
.q-pgrid__value {
    color: var(--q-colors-text, #1a1a1a);
    padding: 4px 0;
    box-sizing: border-box;
    word-break: break-word;
    min-width: 0;
}

/* Boolean checkbox */
.q-pgrid__checkbox {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    cursor: default;
    position: relative;
    box-sizing: border-box;
    vertical-align: middle;
}

.q-pgrid__checkbox:checked {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
}

.q-pgrid__checkbox:checked::after {
    content: '';
    position: absolute;
    left: 3px;
    top: 0px;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

/* Chip（数组值） */
.q-pgrid__chip {
    display: inline-block;
    padding: 2px 8px;
    border: 1px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg-subtle, #f5f5f5);
    font-size: 12px;
    line-height: 1.4;
    margin: 2px 4px 2px 0;
    box-sizing: border-box;
}

/* 嵌套 PropertyGrid */
.q-pgrid__value .q-pgrid {
    margin-top: 4px;
    padding-left: 12px;
    border-left: 2px solid var(--q-colors-border, #dcdfe6);
}
`;