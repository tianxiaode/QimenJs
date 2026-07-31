/**
 * Href 超链接文本组件样式 — Metro 风格
 *
 * 方角、简洁、紧凑，与 Text/Breadcrumb 视觉语言一致。
 */

export const hrefCSS = `
/* Href 根元素 */
.q-href {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    line-height: 1.5;
    color: var(--q-colors-primary, #0078d4);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s;
    white-space: nowrap;
}

.q-href:hover {
    color: var(--q-colors-primary-hover, #106ebe);
    text-decoration: underline;
}

.q-href:focus-visible {
    outline: 2px solid var(--q-colors-primary, #0078d4);
    outline-offset: 2px;
    border-radius: 2px;
}

/* 禁用态 */
.q-href--disabled {
    color: var(--q-colors-text-disabled, #999);
    cursor: not-allowed;
    pointer-events: none;
}

.q-href--disabled:hover {
    text-decoration: none;
}
`;
