/**
 * Switch 开关组件样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件只定义 Switch 特有的样式：
 * - wrapper 布局
 * - track 轨道
 * - thumb 滑块
 * - 状态变体（checked / disabled / error）
 * - 尺寸变体
 * - 文字标签
 */

export const switchCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — Switch 特有
 * ═══════════════════════════════════════════════════ */

.q-switch {
    --q-switch-width: 44px;
    --q-switch-height: 22px;
    --q-switch-thumb-size: 18px;
    --q-switch-track-bg: var(--q-colors-border, #dcdfe6);
    --q-switch-track-active-bg: var(--q-colors-primary, #0078d4);
    --q-switch-thumb-bg: #fff;
    --q-switch-transition: 0.2s;
}

/* ═══════════════════════════════════════════════════
 * wrapper
 * ═══════════════════════════════════════════════════ */

.q-switch__wrapper {
    display: inline-flex;
    align-items: center;
}

/* ═══════════════════════════════════════════════════
 * track 轨道
 * ═══════════════════════════════════════════════════ */

.q-switch__track {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: var(--q-switch-width);
    height: var(--q-switch-height);
    background: var(--q-switch-track-bg);
    border-radius: calc(var(--q-switch-height) / 2);
    cursor: pointer;
    transition: background var(--q-switch-transition);
    box-sizing: border-box;
    user-select: none;
}

.q-switch--checked .q-switch__track {
    background: var(--q-switch-track-active-bg);
}

/* ═══════════════════════════════════════════════════
 * thumb 滑块
 * ═══════════════════════════════════════════════════ */

.q-switch__thumb {
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    width: var(--q-switch-thumb-size);
    height: var(--q-switch-thumb-size);
    background: var(--q-switch-thumb-bg);
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: left var(--q-switch-transition);
}

.q-switch--checked .q-switch__thumb {
    left: calc(var(--q-switch-width) - var(--q-switch-thumb-size) - 2px);
}

/* ═══════════════════════════════════════════════════
 * 文字标签（通过 data-text 属性）
 * ═══════════════════════════════════════════════════ */

.q-switch__track[data-text]::after {
    content: attr(data-text);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    pointer-events: none;
}

.q-switch:not(.q-switch--checked) .q-switch__track[data-text]::after {
    right: 6px;
    color: var(--q-colors-text-placeholder, #bfbfbf);
}

.q-switch--checked .q-switch__track[data-text]::after {
    left: 6px;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-switch--disabled .q-switch__track {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    cursor: not-allowed;
}

.q-switch--disabled.q-switch--checked .q-switch__track {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.4));
}

.q-switch--disabled .q-switch__thumb {
    opacity: 0.6;
}

.q-switch--error .q-switch__track {
    border: 2px solid var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-switch--sm {
    --q-switch-width: 36px;
    --q-switch-height: 18px;
    --q-switch-thumb-size: 14px;
}

.q-switch--md {
    --q-switch-width: 44px;
    --q-switch-height: 22px;
    --q-switch-thumb-size: 18px;
}

.q-switch--lg {
    --q-switch-width: 52px;
    --q-switch-height: 26px;
    --q-switch-thumb-size: 22px;
}
`;
