// ══════════════════════════════════════════════════════════════
// 隐藏模式
// ══════════════════════════════════════════════════════════════

/**
 * 隐藏模式 — 控制 hidden 时的 DOM 表现
 *
 * - 'display': display: none（默认，不占空间）
 * - 'visibility': visibility: hidden（占空间但不可见）
 * - 'opacity': opacity: 0（不可见但可交互）
 */
export type HiddenMode = 'display' | 'visibility' | 'opacity';

/**
 * 隐藏声明
 */
export interface HiddenDecl {
    hidden?: boolean;
    hiddenMode?: HiddenMode;
}
