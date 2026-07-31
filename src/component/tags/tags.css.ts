/**
 * Tags 标签组样式 — Metro 风格
 *
 * 横向排列、紧凑间距、+N 折叠 tag 可点击高亮。
 * 复用 .q-tag 单项样式与 .q-itemgroup 容器布局。
 */

export const tagsCSS = `
/* Tags 根容器 */
.q-tags {
    display: inline-flex;
    box-sizing: border-box;
}

/* 子项挂载区 */
.q-tags__items {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
}

/* 纵向排列 */
.q-tags.q-itemgroup--vertical .q-tags__items {
    flex-direction: column;
    align-items: stretch;
}

/* "+N" 折叠 tag */
.q-tags__overflow-tag {
    cursor: pointer;
    border-style: dashed;
    opacity: 0.85;
    transition: opacity 0.15s ease, background-color 0.15s ease;
}

.q-tags__overflow-tag:hover {
    opacity: 1;
    background: var(--q-colors-bg-hover, #f5f5f5);
}
`;
