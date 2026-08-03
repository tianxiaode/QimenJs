/**
 * Slider 滑动条组件样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件只定义 Slider 特有的样式：
 * - wrapper 布局
 * - track 轨道
 * - fill 已填充区域
 * - thumb 滑块
 * - valueLabel 值显示
 * - 状态变体（disabled / dragging / error）
 * - 尺寸变体
 */

export const sliderCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — Slider 特有
 * ═══════════════════════════════════════════════════ */

.q-slider {
    --q-slider-track-height: 4px;
    --q-slider-thumb-size: 16px;
    --q-slider-track-bg: var(--q-colors-border, #dcdfe6);
    --q-slider-fill-bg: var(--q-colors-primary, #0078d4);
    --q-slider-thumb-bg: #fff;
    --q-slider-thumb-border: var(--q-colors-primary, #0078d4);
    --q-slider-thumb-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    --q-slider-transition: 0.15s;
}

/* ═══════════════════════════════════════════════════
 * wrapper
 * ═══════════════════════════════════════════════════ */

.q-slider__wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    user-select: none;
}

/* ═══════════════════════════════════════════════════
 * track 轨道
 * ═══════════════════════════════════════════════════ */

.q-slider__track {
    position: relative;
    flex: 1;
    height: var(--q-slider-track-height);
    background: var(--q-slider-track-bg);
    cursor: pointer;
    box-sizing: border-box;
}

/* ═══════════════════════════════════════════════════
 * fill 已填充区域
 * ═══════════════════════════════════════════════════ */

.q-slider__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--q-slider-fill-bg);
    pointer-events: none;
}

/* ═══════════════════════════════════════════════════
 * thumb 滑块
 * ═══════════════════════════════════════════════════ */

.q-slider__thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--q-slider-thumb-size);
    height: var(--q-slider-thumb-size);
    background: var(--q-slider-thumb-bg);
    border: 2px solid var(--q-slider-thumb-border);
    border-radius: 0;
    box-shadow: var(--q-slider-thumb-shadow);
    cursor: grab;
    transition: box-shadow var(--q-slider-transition);
    box-sizing: border-box;
    z-index: 1;
}

.q-slider__thumb:hover {
    box-shadow: 0 0 0 4px rgba(0, 120, 212, 0.15), var(--q-slider-thumb-shadow);
}

.q-slider--dragging .q-slider__thumb {
    cursor: grabbing;
    box-shadow: 0 0 0 6px rgba(0, 120, 212, 0.2), var(--q-slider-thumb-shadow);
}

/* ═══════════════════════════════════════════════════
 * valueLabel 值显示
 * ═══════════════════════════════════════════════════ */

.q-slider__value {
    min-width: 36px;
    text-align: center;
    font-size: 13px;
    color: var(--q-colors-text, #1a1a1a);
    font-variant-numeric: tabular-nums;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-slider--disabled .q-slider__track {
    cursor: not-allowed;
}

.q-slider--disabled .q-slider__fill {
    background: var(--q-colors-bg-disabled, #f5f5f5);
}

.q-slider--disabled .q-slider__thumb {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
    cursor: not-allowed;
    box-shadow: none;
}

.q-slider--error .q-slider__track {
    background: var(--q-colors-error-light, rgba(209, 52, 56, 0.15));
}

.q-slider--error .q-slider__fill {
    background: var(--q-colors-error, #d13438);
}

.q-slider--error .q-slider__thumb {
    border-color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-slider--sm {
    --q-slider-track-height: 3px;
    --q-slider-thumb-size: 12px;
}

.q-slider--md {
    --q-slider-track-height: 4px;
    --q-slider-thumb-size: 16px;
}

.q-slider--lg {
    --q-slider-track-height: 6px;
    --q-slider-thumb-size: 20px;
}
`;
