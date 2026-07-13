/**
 * MenuItem 菜单项组件样式
 *
 * 支持默认/悬停/禁用/有子菜单等状态。
 */

export const menuCSS = `
/* MenuItem 根元素 */
.q-menu-item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    font-size: 14px;
    line-height: 1.5;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s;
    box-sizing: border-box;
    user-select: none;
    color: var(--q-text-color, #606266);
}

/* 悬停状态 */
.q-menu-item:hover {
    background-color: var(--q-menu-item-hover-bg, #f5f7fa);
}

/* 禁用状态 */
.q-menu-item--disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
    color: var(--q-text-color-secondary, #909399);
}

/* 子菜单展开箭头 */
.q-menu-item .q-expand-arrow {
    position: absolute;
    right: 8px;
    color: var(--q-text-color-secondary, #909399);
}

/* 菜单容器 */
.q-menu {
    position: absolute;
    z-index: var(--q-z-index-menu, 2000);
    min-width: 120px;
    padding: 4px 0;
    background: #fff;
    border: 1px solid var(--q-border-color, #dcdfe6);
    border-radius: var(--q-border-radius, 4px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 菜单内容区 */
.q-menu__content {
    display: flex;
    flex-direction: column;
}
`;
