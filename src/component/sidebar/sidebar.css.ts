/**
 * Sidebar 侧边栏组件样式 — Metro 风格
 *
 * 方角、紧凑、可折叠。折叠时仅显示图标。
 */

export const sidebarCSS = `
/* Sidebar 根元素 */
.q-sidebar {
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100%;
    background: var(--q-colors-bg-elevated, #fafafa);
    border-right: 1px solid var(--q-colors-border, #dcdfe6);
    box-sizing: border-box;
    transition: width 0.2s ease;
    overflow: hidden;
}

/* 头部 */
.q-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--q-colors-border, #dcdfe6);
    flex-shrink: 0;
    min-height: 44px;
}

.q-sidebar__title {
    font-weight: 600;
    font-size: 14px;
    color: var(--q-colors-text, #1a1a1a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 折叠按钮 */
.q-sidebar__toggle {
    width: 24px;
    height: 24px;
    border: 1px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    background: var(--q-colors-bg, #fff);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    padding: 0;
    color: var(--q-colors-text-secondary, #666);
}

.q-sidebar__toggle:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

/* 导航区 */
.q-sidebar__nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
}

/* 菜单项 */
.q-sidebar__item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    color: var(--q-colors-text, #1a1a1a);
    transition: background 0.15s;
    white-space: nowrap;
    overflow: hidden;
}

.q-sidebar__item:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

.q-sidebar__item--active {
    background: var(--q-colors-primary-light, rgba(0, 120, 212, 0.08));
    color: var(--q-colors-primary, #0078d4);
    font-weight: 600;
    border-left: 2px solid var(--q-colors-primary, #0078d4);
    padding-left: 14px;
}

.q-sidebar__item--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.q-sidebar__item--sub {
    padding-left: 40px;
    font-size: 13px;
}

.q-sidebar__item--sub.q-sidebar__item--active {
    padding-left: 38px;
}

/* 图标 */
.q-sidebar__item-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
    margin-right: 10px;
    font-size: 16px;
}

.q-sidebar__item-text {
    overflow: hidden;
    text-overflow: ellipsis;
}

/* === 折叠状态 === */
.q-sidebar--collapsed .q-sidebar__title,
.q-sidebar--collapsed .q-sidebar__item-text {
    display: none;
}

.q-sidebar--collapsed .q-sidebar__item {
    justify-content: center;
    padding: 10px 0;
}

.q-sidebar--collapsed .q-sidebar__item--active {
    border-left: none;
    border-bottom: 2px solid var(--q-colors-primary, #0078d4);
    padding-left: 0;
}

.q-sidebar--collapsed .q-sidebar__item-icon {
    margin-right: 0;
}

.q-sidebar--collapsed .q-sidebar__item--sub {
    display: none;
}

.q-sidebar--collapsed .q-sidebar__header {
    justify-content: center;
    padding: 12px 8px;
}
`;
