/**
 * Select 下拉选择组件样式 — Metro 风格
 *
 * 依赖 input.css.ts 的基础样式。
 * 本文件只定义 Select 特有的样式：
 * - 下拉面板
 * - 选项列表
 * - 选中/禁用/高亮状态
 * - 多选标签
 */

export const selectCSS = `
/* ═══════════════════════════════════════════════════
 * Select 容器
 * ═══════════════════════════════════════════════════ */

.q-select .q-input__field {
    cursor: pointer;
}

.q-select--open .q-input__field {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 下拉箭头
 * ═══════════════════════════════════════════════════ */

.q-select .q-input__slot--dropdown {
    cursor: pointer;
    transition: transform 0.15s;
}

.q-select--open .q-input__slot--dropdown {
    transform: translateY(-50%) rotate(180deg);
}

/* ═══════════════════════════════════════════════════
 * 下拉面板
 * ═══════════════════════════════════════════════════ */

.q-select__panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 240px;
    overflow-y: auto;
    margin-top: 2px;
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
}

/* ═══════════════════════════════════════════════════
 * 选项
 * ═══════════════════════════════════════════════════ */

.q-select__option {
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    transition: background 0.1s;
    user-select: none;
}

.q-select__option:hover {
    background: var(--q-colors-bg-hover, #f0f0f0);
}

.q-select__option--selected {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.08));
    color: var(--q-colors-primary, #0078d4);
    font-weight: 600;
}

.q-select__option--selected:hover {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.12));
}

.q-select__option--disabled {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-select__option--disabled:hover {
    background: transparent;
}

/* ═══════════════════════════════════════════════════
 * 空状态
 * ═══════════════════════════════════════════════════ */

.q-select__empty {
    padding: 16px 12px;
    text-align: center;
    color: var(--q-colors-text-placeholder, #bfbfbf);
    font-size: 14px;
}

/* ═══════════════════════════════════════════════════
 * 禁用状态
 * ═══════════════════════════════════════════════════ */

.q-select.q-input--disabled .q-input__slot--dropdown {
    cursor: not-allowed;
    opacity: 0.4;
}

.q-select.q-input--disabled .q-input__field {
    cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-select--sm .q-select__option {
    padding: 4px 8px;
    font-size: 12px;
}

.q-select--lg .q-select__option {
    padding: 12px 16px;
    font-size: 16px;
}
`;
