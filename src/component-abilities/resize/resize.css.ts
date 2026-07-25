/**
 * ResizeAbility 样式 — 四边/四角拖动手柄
 *
 * Metro 风格：手柄透明，hover 时显示细线指示。
 */

export const resizeCSS = `
/* 可调整大小的容器 */
.q-resizable {
    position: relative;
}

/* 禁用态 */
.q-resizable--disabled .q-resize-handle {
    display: none;
}

/* 拖动激活态 */
.q-resizable--active {
    user-select: none;
}

/* 通用手柄 */
.q-resize-handle {
    position: absolute;
    z-index: 10;
    background: transparent;
}

.q-resize-handle:hover,
.q-resizable--active .q-resize-handle {
    background: var(--q-colors-primary, #0078d4);
    opacity: 0.3;
}

/* ── 四边手柄 ── */

.q-resize-handle--n {
    top: -3px;
    left: 4px;
    right: 4px;
    height: 6px;
}

.q-resize-handle--s {
    bottom: -3px;
    left: 4px;
    right: 4px;
    height: 6px;
}

.q-resize-handle--e {
    top: 4px;
    right: -3px;
    bottom: 4px;
    width: 6px;
}

.q-resize-handle--w {
    top: 4px;
    left: -3px;
    bottom: 4px;
    width: 6px;
}

/* ── 四角手柄 ── */

.q-resize-handle--ne {
    top: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
}

.q-resize-handle--nw {
    top: -3px;
    left: -3px;
    width: 10px;
    height: 10px;
}

.q-resize-handle--se {
    bottom: -3px;
    right: -3px;
    width: 10px;
    height: 10px;
}

.q-resize-handle--sw {
    bottom: -3px;
    left: -3px;
    width: 10px;
    height: 10px;
}
`;
