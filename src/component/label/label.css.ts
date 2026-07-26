/**
 * Label 标签组件样式 — Metro 风格
 *
 * 独立标签，方角、高对比、紧凑排版。
 */

export const labelCSS = `
.q-label {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    line-height: 1.5;
    cursor: default;
}

.q-label__required-mark {
    color: var(--q-colors-error, #d13438);
    font-weight: 700;
    margin: 0 2px;
}

.q-label__required-mark--before {
    order: -1;
    margin-right: 4px;
    margin-left: 0;
}

.q-label__required-mark--after {
    order: 1;
    margin-left: 2px;
    margin-right: 0;
}
`;
