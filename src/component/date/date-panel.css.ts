/**
 * date-panel.css.ts — 日期时间选择器面板共用样式 — Metro 风格
 *
 * 所有面板（年/月/日/时/分/秒）共用此样式文件：
 * - 面板容器
 * - 导航栏（返回/上一步/标题/确认）
 * - 数字矩阵网格
 * - 高位按钮行（千位/十位）
 * - 年份4列布局
 * - 预览栏
 * - 日期网格特有样式
 */

export const datePanelCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — 面板共用
 * ═══════════════════════════════════════════════════ */

.q-dtpanel {
    --q-dtpanel-row-height: 32px;
    --q-dtpanel-cell-min-size: 48px;
    --q-dtpanel-nav-height: 32px;
    --q-dtpanel-font-size: 14px;
    --q-dtpanel-title-font-size: 13px;
    --q-dtpanel-max-height: 320px;

    --q-dtpanel-icon-font: inherit;
    --q-dtpanel-icon-weight: inherit;

    --q-dtpanel-icon-prev: '◀';
    --q-dtpanel-icon-next: '▶';
    --q-dtpanel-icon-up: '▲';
    --q-dtpanel-icon-down: '▼';
    --q-dtpanel-icon-confirm: '✓';
    --q-dtpanel-icon-cancel: '✕';
}

/* ═══════════════════════════════════════════════════
 * 面板容器
 * ═══════════════════════════════════════════════════ */

.q-dtpanel {
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    padding: 4px 0;
    user-select: none;
    max-height: var(--q-dtpanel-max-height);
    overflow-y: auto;
}

/* ═══════════════════════════════════════════════════
 * 导航栏 — 单行: [◀ prev] [▶ next] [preview...] [✓] [✕]
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__nav {
    display: flex;
    align-items: center;
    height: var(--q-dtpanel-nav-height);
    padding: 0 4px;
    border-bottom: 1px solid var(--q-colors-border-light, #e8e8e8);
    gap: 2px;
}

.q-dtpanel__nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 4px;
    border: none;
    background: transparent;
    color: var(--q-colors-text-secondary, #666);
    font-size: var(--q-dtpanel-font-size);
    cursor: pointer;
    border-radius: 0;
    transition: background 0.1s, color 0.1s;
    flex-shrink: 0;
}

.q-dtpanel__nav-btn:hover {
    background: var(--q-colors-bg-hover, #f0f0f0);
    color: var(--q-colors-text, #1a1a1a);
}

.q-dtpanel__nav-btn--disabled {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-dtpanel__nav-btn--disabled:hover {
    background: transparent;
    color: var(--q-colors-text-disabled, #bfbfbf);
}

.q-dtpanel__nav-btn--prev::after { content: var(--q-dtpanel-icon-prev); }
.q-dtpanel__nav-btn--next::after { content: var(--q-dtpanel-icon-next); }
.q-dtpanel__nav-btn--up::after { content: var(--q-dtpanel-icon-up); }
.q-dtpanel__nav-btn--down::after { content: var(--q-dtpanel-icon-down); }
.q-dtpanel__nav-btn--confirm::after { content: var(--q-dtpanel-icon-confirm); }
.q-dtpanel__nav-btn--cancel::after { content: var(--q-dtpanel-icon-cancel); }

.q-dtpanel__nav-btn--prev::after,
.q-dtpanel__nav-btn--next::after,
.q-dtpanel__nav-btn--up::after,
.q-dtpanel__nav-btn--down::after,
.q-dtpanel__nav-btn--confirm::after,
.q-dtpanel__nav-btn--cancel::after {
    font-family: var(--q-dtpanel-icon-font);
    font-weight: var(--q-dtpanel-icon-weight);
}

.q-dtpanel__nav-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
    gap: 1px;
    font-size: var(--q-dtpanel-title-font-size);
    color: var(--q-colors-text, #1a1a1a);
    overflow: hidden;
}

.q-dtpanel__nav-confirm {
    color: var(--q-colors-primary, #0078d4);
    font-weight: 600;
}

.q-dtpanel__nav-confirm:hover {
    color: var(--q-colors-primary-dark, #005a9e);
}

.q-dtpanel__nav-cancel {
    color: var(--q-colors-text-secondary, #666);
}

.q-dtpanel__nav-cancel:hover {
    color: var(--q-colors-danger, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 导航栏内预览字段
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__preview-field {
    cursor: pointer;
    padding: 0 2px;
    border-bottom: 2px solid transparent;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
}

.q-dtpanel__preview-field:hover {
    border-bottom-color: var(--q-colors-primary, #0078d4);
}

.q-dtpanel__preview-field--active {
    color: var(--q-colors-primary, #0078d4);
    font-weight: 600;
    border-bottom-color: var(--q-colors-primary, #0078d4);
}

.q-dtpanel__preview-sep {
    color: var(--q-colors-text-secondary, #666);
    flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════
 * 高位按钮行（千位/十位）
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__high-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
}

.q-dtpanel__high-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    height: 36px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 0;
    transition: border-color 0.15s, background 0.15s;
}

.q-dtpanel__high-btn:hover {
    border-color: var(--q-colors-primary, #0078d4);
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.06));
}

.q-dtpanel__high-btn--active {
    border-color: var(--q-colors-primary, #0078d4);
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.12));
    color: var(--q-colors-primary, #0078d4);
}

/* ═══════════════════════════════════════════════════
 * 数字矩阵网格
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__grid {
    display: grid;
    gap: 0;
    padding: 4px 12px;
}

.q-dtpanel__cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--q-dtpanel-cell-min-size);
    height: var(--q-dtpanel-row-height);
    font-size: var(--q-dtpanel-font-size);
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    border-radius: 0;
    transition: background 0.1s, color 0.1s;
}

.q-dtpanel__cell:hover {
    background: var(--q-colors-bg-hover, #f0f0f0);
}

.q-dtpanel__cell--active {
    background: var(--q-colors-primary, #0078d4);
    color: #fff;
    font-weight: 600;
}

.q-dtpanel__cell--active:hover {
    background: var(--q-colors-primary-dark, #005a9e);
}

.q-dtpanel__cell--disabled {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: default;
}

.q-dtpanel__cell--disabled:hover {
    background: transparent;
}

/* ═══════════════════════════════════════════════════
 * 年份面板 — 4列统一布局（千/百/十/个位）
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__digit-columns {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
}

.q-dtpanel__digit-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.q-dtpanel__digit-header {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    height: 28px;
    font-size: 18px;
    font-weight: 700;
    color: var(--q-colors-primary, #0078d4);
    border-bottom: 2px solid var(--q-colors-primary, #0078d4);
}

.q-dtpanel__digit-split {
    display: flex;
    gap: 2px;
}

.q-dtpanel__digit-subcol {
    display: flex;
    flex-direction: column;
}


/* ═══════════════════════════════════════════════════
 * 日期面板特有
 * ═══════════════════════════════════════════════════ */

.q-dtpanel__date-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 8px;
}

.q-dtpanel__date-nav-label {
    font-size: var(--q-dtpanel-font-size);
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    padding: 0 4px;
}

.q-dtpanel__date-nav-label:hover {
    color: var(--q-colors-primary, #0078d4);
}

.q-dtpanel__weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 4px 12px 0;
}

.q-dtpanel__weekday-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    font-size: 12px;
    color: var(--q-colors-text-secondary, #666);
    font-weight: 600;
}

.q-dtpanel__day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    padding: 0 12px 4px;
}

.q-dtpanel__day-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--q-dtpanel-cell-min-size);
    height: 28px;
    font-size: var(--q-dtpanel-font-size);
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    border-radius: 0;
    transition: background 0.1s, color 0.1s;
    position: relative;
}

.q-dtpanel__day-cell:hover {
    background: var(--q-colors-bg-hover, #f0f0f0);
}

.q-dtpanel__day-cell--active {
    background: var(--q-colors-primary, #0078d4);
    color: #fff;
    font-weight: 600;
}

.q-dtpanel__day-cell--active:hover {
    background: var(--q-colors-primary-dark, #005a9e);
}

.q-dtpanel__day-cell--other-month {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: default;
}

.q-dtpanel__day-cell--other-month:hover {
    background: transparent;
}

.q-dtpanel__day-cell--today::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--q-colors-primary, #0078d4);
}

.q-dtpanel__day-cell--active.q-dtpanel__day-cell--today::after {
    background: #fff;
}

.q-dtpanel__quick-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 12px 8px;
    border-top: 1px solid var(--q-colors-border-light, #e8e8e8);
}

.q-dtpanel__quick-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border: 1px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text-secondary, #666);
    font-size: 12px;
    cursor: pointer;
    border-radius: 0;
    transition: border-color 0.15s, background 0.15s;
}

.q-dtpanel__quick-btn:hover {
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
}
`;
