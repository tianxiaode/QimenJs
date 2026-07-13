/**
 * ArrowAbility 通用箭头样式
 *
 * 通过 CSS 变量驱动，组件初始化时覆盖变量即可自定义样式。
 *
 * CSS 变量：
 * - --q-arrow-color：箭头颜色，默认 var(--q-color-dark, #303133)
 * - --q-arrow-size：箭头尺寸（px），默认 5
 */

export const arrowCSS = `
/* 箭头基础 */
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
`;
