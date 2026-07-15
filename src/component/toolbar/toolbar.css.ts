/**
 * Toolbar 工具栏组件样式 — Metro 风格
 *
 * 方角、粗边框、无阴影、高对比色块。
 */

export const toolbarCSS = `
/* ─── Toolbar 根元素 ─── */
.q-toolbar {
    display: flex;
    position: relative;
    overflow: hidden;
}

.q-toolbar--horizontal {
    flex-direction: row;
    align-items: center;
}

.q-toolbar--vertical {
    flex-direction: column;
    align-items: stretch;
}

/* ─── 溢出滚动模式 ─── */
.q-overflow-scroll {
    position: relative;
}

.q-overflow-scroll--horizontal {
    flex-direction: row;
}

.q-overflow-scroll--vertical {
    flex-direction: column;
}

/* 滚动区域 */
.q-overflow-scroll__area {
    display: flex;
    overflow: hidden;
    flex: 1;
    min-width: 0;
    min-height: 0;
}

.q-overflow-scroll--horizontal .q-overflow-scroll__area {
    flex-direction: row;
    align-items: center;
}

.q-overflow-scroll--vertical .q-overflow-scroll__area {
    flex-direction: column;
    align-items: stretch;
}

/* 箭头按钮 */
.q-overflow-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: 2px solid var(--q-colors-border, #e0e0e0);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text-secondary, #666);
    cursor: pointer;
    border-radius: 0;
    z-index: 1;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    box-shadow: none;
}

.q-overflow-arrow:hover {
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
}

/* 横向箭头定位 */
.q-overflow-arrow--prev.q-overflow-arrow--horizontal {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
}

.q-overflow-arrow--next.q-overflow-arrow--horizontal {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
}

/* 纵向箭头定位 */
.q-overflow-arrow--prev.q-overflow-arrow--vertical {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.q-overflow-arrow--next.q-overflow-arrow--vertical {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

/* 箭头图标 — 用 CSS border 绘制 */
.q-overflow-arrow i {
    display: block;
    width: 8px;
    height: 8px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
}

/* 横向：左箭头 */
.q-overflow-arrow--prev.q-overflow-arrow--horizontal i {
    transform: rotate(135deg);
    margin-left: 3px;
}

/* 横向：右箭头 */
.q-overflow-arrow--next.q-overflow-arrow--horizontal i {
    transform: rotate(-45deg);
    margin-right: 3px;
}

/* 纵向：上箭头 */
.q-overflow-arrow--prev.q-overflow-arrow--vertical i {
    transform: rotate(-135deg);
    margin-top: 3px;
}

/* 纵向：下箭头 */
.q-overflow-arrow--next.q-overflow-arrow--vertical i {
    transform: rotate(45deg);
    margin-bottom: 3px;
}

/* 滚动区域在有箭头时的内边距 */
.q-overflow-scroll--can-prev.q-overflow-scroll--horizontal .q-overflow-scroll__area {
    padding-left: 4px;
}

.q-overflow-scroll--can-next.q-overflow-scroll--horizontal .q-overflow-scroll__area {
    padding-right: 4px;
}

.q-overflow-scroll--can-prev.q-overflow-scroll--vertical .q-overflow-scroll__area {
    padding-top: 4px;
}

.q-overflow-scroll--can-next.q-overflow-scroll--vertical .q-overflow-scroll__area {
    padding-bottom: 4px;
}

/* ─── 溢出菜单模式 ─── */
.q-overflow-menu-container {
    position: relative;
    overflow: hidden;
}

.q-overflow-menu-container--horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.q-overflow-menu-container--vertical {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

/* 可见区域 */
.q-overflow-menu__visible {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}

.q-overflow-menu-container--horizontal .q-overflow-menu__visible {
    flex-direction: row;
    align-items: center;
}

.q-overflow-menu-container--vertical .q-overflow-menu__visible {
    flex-direction: column;
    align-items: stretch;
}

/* 下拉触发按钮 */
.q-overflow-menu__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: 2px solid var(--q-colors-border, #e0e0e0);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text-secondary, #666);
    cursor: pointer;
    border-radius: 0;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    box-shadow: none;
}

.q-overflow-menu__trigger:hover,
.q-overflow-menu__trigger--active {
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
}

/* 横向触发按钮定位 */
.q-overflow-menu__trigger--horizontal {
    margin-left: 4px;
}

/* 纵向触发按钮定位 */
.q-overflow-menu__trigger--vertical {
    margin-top: 4px;
    align-self: center;
}

/* 触发图标 — 三个点 */
.q-overflow-menu__trigger-icon {
    display: flex;
    gap: 2px;
}

.q-overflow-menu__trigger-icon--horizontal::before,
.q-overflow-menu__trigger-icon--horizontal::after,
.q-overflow-menu__trigger-icon--vertical::before,
.q-overflow-menu__trigger-icon--vertical::after {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 0;
    background: currentColor;
}

/* 横向：三个点水平排列 */
.q-overflow-menu__trigger-icon--horizontal {
    flex-direction: row;
}

.q-overflow-menu__trigger-icon--horizontal::before {
    content: '';
}

/* 纵向：三个点垂直排列 */
.q-overflow-menu__trigger-icon--vertical {
    flex-direction: column;
}

/* 下拉菜单面板 */
.q-overflow-menu__panel {
    position: absolute;
    min-width: 120px;
    max-height: 240px;
    overflow-y: auto;
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #e0e0e0);
    border-radius: 0;
    box-shadow: none;
    z-index: 10;
}

.q-overflow-menu__panel--horizontal {
    right: 0;
}

.q-overflow-menu__panel--vertical {
    left: 0;
}

/* 菜单项 */
.q-overflow-menu__item {
    padding: 8px 12px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 500;
    color: var(--q-colors-text, #1a1a1a);
    transition: background 0.15s, color 0.15s;
}

.q-overflow-menu__item:hover {
    background: rgba(0, 120, 212, 0.06);
    color: var(--q-colors-primary, #0078d4);
}
`;
