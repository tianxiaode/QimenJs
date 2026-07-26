/**
 * Fieldset 字段集组件样式 — Metro 风格
 *
 * 表单分组容器，方角、粗边框、高对比。
 */

export const fieldsetCSS = `
.q-fieldset {
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    padding: 16px;
    margin: 0;
    background: transparent;
}

.q-fieldset__legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: default;
    border: none;
    background: transparent;
}

.q-fieldset__toggle-icon {
    font-size: 10px;
    line-height: 1;
    color: var(--q-colors-text-secondary, #666);
    transition: transform 0.15s ease;
}

.q-fieldset__legend-text {
    line-height: 1.5;
}

.q-fieldset__content {
    padding-top: 8px;
}

.q-fieldset--collapsed .q-fieldset__legend {
    cursor: pointer;
}

.q-fieldset--collapsed .q-fieldset__toggle-icon {
    cursor: pointer;
}

.q-fieldset:not(.q-fieldset--collapsed) .q-fieldset__legend {
    cursor: default;
}
`;
