/**
 * Breadcrumb 面包屑导航组件样式 — Metro 风格
 *
 * 路径导航，支持自定义分隔符和点击跳转。
 * 方角、简洁、紧凑。
 */

export const breadcrumbCSS = `
/* Breadcrumb 根元素 */
.q-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 1.5;
}

/* 列表 */
.q-breadcrumb__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
}

/* 面包屑项 */
.q-breadcrumb__item {
    display: inline-flex;
    align-items: center;
}

/* 文本 */
.q-breadcrumb__text {
    color: var(--q-colors-primary, #0078d4);
    cursor: pointer;
    transition: color 0.15s;
    text-decoration: none;
}

.q-breadcrumb__text:hover {
    color: var(--q-colors-primary-hover, #106ebe);
    text-decoration: underline;
}

/* 当前激活项 */
.q-breadcrumb__item--active .q-breadcrumb__text {
    color: var(--q-colors-text, #1a1a1a);
    font-weight: 600;
    cursor: default;
}

.q-breadcrumb__item--active .q-breadcrumb__text:hover {
    text-decoration: none;
}

/* 分隔符 */
.q-breadcrumb__separator {
    margin: 0 8px;
    color: var(--q-colors-text-secondary, #666);
    user-select: none;
}
`;
