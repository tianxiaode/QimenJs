/**
 * DatePicker 日期时间选择器样式 — Metro 风格
 *
 * 依赖 input.css.ts 的基础样式。
 * 本文件只定义 DatePicker 特有的样式：
 * - 下拉浮层容器
 * - 预览栏（在 dropdown 内）
 * - 面板区域
 */

export const datepickerCSS = `
/* ═══════════════════════════════════════════════════
 * DatePicker 容器
 * ═══════════════════════════════════════════════════ */

.q-datepicker .q-input__field {
    cursor: pointer;
}

.q-datepicker--open .q-input__field {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 下拉浮层
 * ═══════════════════════════════════════════════════ */

.q-datepicker__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    margin-top: 2px;
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    padding: 0;
}

/* ═══════════════════════════════════════════════════
 * 面板区域
 * ═══════════════════════════════════════════════════ */

.q-datepicker__panel-area {
    padding: 0;
}

/* ═══════════════════════════════════════════════════
 * 禁用状态
 * ═══════════════════════════════════════════════════ */

.q-datepicker.q-input--disabled .q-input__slot--dropdown {
    cursor: not-allowed;
    opacity: 0.4;
}

.q-datepicker.q-input--disabled .q-input__field {
    cursor: not-allowed;
}
`;
