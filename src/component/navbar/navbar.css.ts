/**
 * Navbar 顶部导航栏样式 — 横向布局
 *
 * 与 ItemGroup 共享底层结构（itemContainer = flex 容器 + order 排序），
 * 此处仅覆盖视觉外观：高度、背景、边框、内边距。
 */

export const navbarCSS = `
/* Navbar 根元素 */
.q-navbar {
    display: flex;
    align-items: center;
    flex-direction: row;
    min-height: 56px;
    padding: 0 16px;
    background: var(--q-colors-bg, #ffffff);
    border-bottom: 1px solid var(--q-colors-border, #dcdfe6);
    box-sizing: border-box;
    gap: 16px;
}

/* Navbar 已由 ItemGroup 控制方向；移除可能的纵向干扰 */
.q-navbar.q-itemgroup--vertical {
    flex-direction: row;
}

/* itemContainer（来自 ITEMGROUP_BASE_TPL 的 itemContainer 节点） */
.q-navbar__items {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 16px;
}

/* 默认公司名 */
.q-navbar__company {
    font-size: 16px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    white-space: nowrap;
}

/* 默认 Logo */
.q-navbar__logo {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
    color: var(--q-colors-primary, #0078d4);
}

/* 溢出按钮（来自 ITEMGROUP_BASE_TPL）在 Navbar 中的外观微调 */
.q-navbar .q-itemgroup__overflow-prev,
.q-navbar .q-itemgroup__overflow-next,
.q-navbar .q-itemgroup__overflow-more {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--q-colors-text-secondary, #666);
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.q-navbar .q-itemgroup__overflow-prev:hover,
.q-navbar .q-itemgroup__overflow-next:hover,
.q-navbar .q-itemgroup__overflow-more:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
}
`;
