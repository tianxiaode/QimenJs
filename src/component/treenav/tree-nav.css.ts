/**
 * TreeNav 组件样式 — Metro 风格
 *
 * 纵向树形列表，内联展开 + depth 缩进。
 * 缩进步长通过 --q-indent-step CSS 变量统调，深度通过 --q-item-depth 变量传递。
 */

export const treeNavCSS = `
.q-tree-nav {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.q-tree-nav > .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
}

.q-tree-nav-item {
    display: flex;
    flex-direction: column;
}

.q-tree-nav-item__content {
    display: flex;
    align-items: center;
    gap: var(--q-tree-nav-item-gap, 8px);
    width: 100%;
    padding: 8px 16px;
    padding-left: calc(16px + var(--q-item-depth, 0) * var(--q-indent-step, 16px));
    color: var(--q-colors-text-secondary, #666);
    cursor: pointer;
    user-select: none;
    transition: background 0.15s, color 0.15s;
    font-weight: 500;
}

.q-tree-nav-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--q-font-size-lg, 18px);
    min-width: 20px;
}

.q-tree-nav-item__text {
    font-size: var(--q-font-size-md, 14px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.q-tree-nav-item__expand {
    display: none;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    font-size: var(--q-font-size-sm, 12px);
    transition: transform 0.15s;
    color: var(--q-colors-text-secondary, #666);
}

.q-tree-nav-item__expand::after {
    content: '›';
}

.q-tree-nav-item--expanded .q-tree-nav-item__expand {
    transform: rotate(90deg);
}

.q-tree-nav-item--has-children .q-tree-nav-item__expand {
    display: flex;
}

.q-tree-nav-item__children {
    display: flex;
    flex-direction: column;
}

.q-tree-nav-item:hover .q-tree-nav-item__content {
    color: var(--q-colors-primary, #0078d4);
    background: rgba(0, 120, 212, 0.06);
}

.q-tree-nav-item--active .q-tree-nav-item__content {
    color: var(--q-colors-primary, #0078d4);
    background: rgba(0, 120, 212, 0.1);
    font-weight: 700;
}

.q-tree-nav-item--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
}
`;
