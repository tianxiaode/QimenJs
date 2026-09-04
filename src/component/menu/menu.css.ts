/**
 * Menu 菜单组件样式 — Metro 风格
 *
 * MenuItem 相关样式已迁移至 menuitem.css。
 */

export const menuCSS = `
/* 菜单容器 */
.q-menu {
    position: absolute;
    z-index: var(--q-z-index-menu, 2000);
    min-width: 120px;
    padding: 4px 0;
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #e0e0e0);
    border-radius: var(--q-radius-md, 0);
    box-shadow: none;
}

/* 菜单内容区 */
.q-menu__content {
    display: flex;
    flex-direction: column;
}
`;
