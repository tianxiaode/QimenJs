/**
 * 箭头通用样式
 *
 * 包含 ArrowAbility（浮层定位箭头）和 ExpandArrowAbility（展开/折叠箭头）的样式。
 * 默认用 CSS border 三角形，开发者覆盖 i::before 即可替换为任意图标方案。
 *
 * 图标替换方式（覆盖 i::before）：
 *   .q-menu-item .q-expand-arrow i::before {
 *       content: '\f054';
 *       font-family: 'Font Awesome 6 Free';
 *       width: auto; height: auto; border: none;
 *   }
 *
 * ArrowAbility CSS 变量：
 * - --q-arrow-color：箭头颜色，默认 var(--q-color-dark, #303133)
 * - --q-arrow-size：箭头尺寸（px），默认 5
 *
 * ExpandArrowAbility CSS 变量：
 * - --q-expand-arrow-color：箭头颜色，默认 var(--q-color-text, #606266)
 * - --q-expand-arrow-size：箭头尺寸（px），默认 12
 */

export const arrowCSS = `
/* ─── ArrowAbility 浮层定位箭头 ─── */

.q-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: var(--q-arrow-size, 5px);
    border-color: transparent;
}

/* 方向：上方弹出，箭头朝下 */
.q-arrow--top {
    bottom: calc(-2 * var(--q-arrow-size, 5px));
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--q-arrow-color, var(--q-color-dark, #303133));
    border-bottom-width: 0;
}

/* 方向：下方弹出，箭头朝上 */
.q-arrow--bottom {
    top: calc(-2 * var(--q-arrow-size, 5px));
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: var(--q-arrow-color, var(--q-color-dark, #303133));
    border-top-width: 0;
}

/* 方向：左侧弹出，箭头朝右 */
.q-arrow--left {
    right: calc(-2 * var(--q-arrow-size, 5px));
    top: 50%;
    transform: translateY(-50%);
    border-left-color: var(--q-arrow-color, var(--q-color-dark, #303133));
    border-right-width: 0;
}

/* 方向：右侧弹出，箭头朝左 */
.q-arrow--right {
    left: calc(-2 * var(--q-arrow-size, 5px));
    top: 50%;
    transform: translateY(-50%);
    border-right-color: var(--q-arrow-color, var(--q-color-dark, #303133));
    border-left-width: 0;
}

/* ─── ExpandArrowAbility 展开/折叠箭头 ─── */

.q-expand-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--q-expand-arrow-size, 12px);
    height: var(--q-expand-arrow-size, 12px);
    cursor: pointer;
    flex-shrink: 0;
}

.q-expand-arrow i {
    display: block;
    width: 100%;
    height: 100%;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
}

/* 默认 border 三角形，覆盖 i::before 可替换为字体图标 */
.q-expand-arrow i::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px;
    border-color: transparent;
    transition: transform 0.2s ease;
}

/* 折叠状态：箭头朝右 ▶ */
.q-expand-arrow--collapsed i::before {
    border-left-color: var(--q-expand-arrow-color, var(--q-color-text, #606266));
    border-right-width: 0;
}

/* 展开状态：箭头朝下 ▼ */
.q-expand-arrow--expanded i::before {
    border-top-color: var(--q-expand-arrow-color, var(--q-color-text, #606266));
    border-bottom-width: 0;
}

/* ─── 溢出滚动箭头 ─── */

.q-overflow-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

.q-overflow-arrow i {
    display: block;
    width: 100%;
    height: 100%;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
}

/* 默认 border 三角形，覆盖 i::before 可替换为字体图标 */
.q-overflow-arrow i::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px;
    border-color: transparent;
}

/* 横向：prev 朝左 ◀，next 朝右 ▶ */
.q-overflow-arrow--prev.q-overflow-arrow--horizontal i::before {
    border-right-color: var(--q-color-text, #606266);
    border-left-width: 0;
}

.q-overflow-arrow--next.q-overflow-arrow--horizontal i::before {
    border-left-color: var(--q-color-text, #606266);
    border-right-width: 0;
}

/* 纵向：prev 朝上 ▲，next 朝下 ▼ */
.q-overflow-arrow--prev.q-overflow-arrow--vertical i::before {
    border-bottom-color: var(--q-color-text, #606266);
    border-top-width: 0;
}

.q-overflow-arrow--next.q-overflow-arrow--vertical i::before {
    border-top-color: var(--q-color-text, #606266);
    border-bottom-width: 0;
}

/* ─── 组件级箭头覆盖 ─── */

/* Dropdown 下拉浮层箭头 */
.q-dropdown .q-arrow {
    --q-arrow-color: #fff;
    --q-arrow-size: 6px;
}

/* Popover 弹出框箭头 */
.q-popover .q-arrow {
    --q-arrow-color: #fff;
    --q-arrow-size: 6px;
}

/* Select 下拉选择展开箭头 */
.q-select .q-expand-arrow {
    --q-expand-arrow-color: var(--q-text-color-secondary, #909399);
    --q-expand-arrow-size: 14px;
}
`;
