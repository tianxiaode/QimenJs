/**
 * MenuItem 菜单项组件样式 — Metro 风格
 *
 * 方角、粗边框、无阴影、高对比色块。
 */

export const menuCSS = `
/* MenuItem 根元素 */
.q-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    box-sizing: border-box;
    user-select: none;
    color: var(--q-colors-text, #1a1a1a);
}

/* 悬停状态 */
.q-menu-item:hover {
    background: rgba(0, 120, 212, 0.06);
    color: var(--q-colors-primary, #0078d4);
}

/* 禁用状态 */
.q-menu-item--disabled {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
}

/* 有子菜单 */
.q-menu-item--has-submenu {
    padding-right: 28px;
}

/* 图标 */
.q-menu-item__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    min-width: 20px;
    margin-right: 8px;
    font-size: 16px;
}

/* 文本 */
.q-menu-item__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 快捷键 */
.q-menu-item__shortcut {
    display: inline-flex;
    align-items: center;
    margin-left: 24px;
    font-size: 12px;
    color: var(--q-colors-text-secondary, #666);
}

/* 子菜单展开箭头 */
.q-menu-item .q-expand-arrow {
    position: absolute;
    right: 8px;
    color: var(--q-colors-text-secondary, #666);
}

/* 菜单容器 */
.q-menu {
    position: absolute;
    z-index: var(--q-z-index-menu, 2000);
    min-width: 120px;
    padding: 4px 0;
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #e0e0e0);
    border-radius: 0;
    box-shadow: none;
}

/* 菜单内容区 */
.q-menu__content {
    display: flex;
    flex-direction: column;
}
`;
