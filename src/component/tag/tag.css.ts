/**
 * Tag 标签组件样式 — Metro 风格
 *
 * 紧凑标记，支持 default/primary/success/warning/error/info 六种类型色。
 * 可关闭、支持图标和尺寸变体。
 * 方角、粗边框、高对比色块。
 */

export const tagCSS = `
/* Tag 根元素 */
.q-tag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border: 1px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    box-sizing: border-box;
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
    vertical-align: middle;
}

/* 类型：默认 */
.q-tag--default {
    background: var(--q-colors-bg, #fff);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
}

/* 类型：主要 */
.q-tag--primary {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-on-primary, #fff);
}

/* 类型：成功 */
.q-tag--success {
    background: var(--q-colors-success, #107c10);
    border-color: var(--q-colors-success, #107c10);
    color: var(--q-colors-on-success, #fff);
}

/* 类型：警告 */
.q-tag--warning {
    background: var(--q-colors-warning, #ca5010);
    border-color: var(--q-colors-warning, #ca5010);
    color: var(--q-colors-on-warning, #fff);
}

/* 类型：错误 */
.q-tag--error {
    background: var(--q-colors-error, #d13438);
    border-color: var(--q-colors-error, #d13438);
    color: var(--q-colors-on-error, #fff);
}

/* 类型：信息 */
.q-tag--info {
    background: var(--q-colors-info, #0078d4);
    border-color: var(--q-colors-info, #0078d4);
    color: var(--q-colors-on-info, #fff);
}

/* 图标 */
.q-tag__icon {
    margin-right: 4px;
    font-size: 12px;
    line-height: 1;
}

/* 文本 */
.q-tag__text {
    line-height: 1;
}

/* 关闭按钮 */
.q-tag__close {
    margin-left: 4px;
    margin-right: -4px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    color: inherit;
    opacity: 0.7;
    transition: opacity 0.15s;
    background: none;
    border: none;
    padding: 0;
    user-select: none;
}

.q-tag__close:hover {
    opacity: 1;
}

/* 尺寸：小 */
.q-tag--sm {
    height: 18px;
    padding: 0 6px;
    font-size: 11px;
}

.q-tag--sm .q-tag__icon {
    font-size: 11px;
}

/* 尺寸：中（默认） */
.q-tag--md {
    height: 22px;
    padding: 0 8px;
    font-size: 12px;
}

/* 尺寸：大 */
.q-tag--lg {
    height: 28px;
    padding: 0 12px;
    font-size: 14px;
}

.q-tag--lg .q-tag__icon {
    font-size: 14px;
}
`;
