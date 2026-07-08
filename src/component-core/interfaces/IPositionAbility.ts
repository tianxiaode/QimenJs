/**
 * 位置/尺寸/布局约束能力接口
 *
 * 提供组件的定位、尺寸和布局约束属性，通过 getter/setter 直接操作 el.style。
 * 所有组件都可能需要定位/尺寸控制，属于 BASE 能力。
 */

/** 隐藏模式 */
export type HideMode = 'display' | 'visibility' | 'opacity';

export interface IPositionAbility {
    // ── 定位 ──

    /** 水平位置 */
    x: number;
    /** 垂直位置 */
    y: number;
    /** 定位 top */
    top: number;
    /** 定位 left */
    left: number;
    /** 定位 bottom */
    bottom: number;
    /** 定位 right */
    right: number;

    // ── 尺寸 ──

    /** 宽度 */
    width: number;
    /** 高度 */
    height: number;

    // ── 约束 ──

    /** 最小宽度 */
    minWidth: number;
    /** 最大宽度 */
    maxWidth: number;
    /** 最小高度 */
    minHeight: number;
    /** 最大高度 */
    maxHeight: number;

    // ── 间距 ──

    /** 外边距 */
    margin: string;
    /** 内边距 */
    padding: string;

    // ── 滚动 ──

    /** 是否可滚动 */
    scrollable: boolean;

    // ── 居中 ──

    /** 内容居中 */
    center: boolean;

    // ── 隐藏模式 ──

    /**
     * 隐藏模式，决定 visible=false 时如何隐藏
     * - 'display': display:none（默认，不占空间）
     * - 'visibility': visibility:hidden（占空间但不可见）
     * - 'opacity': opacity:0（占空间且透明）
     */
    hideMode: HideMode;

    // ── 层叠与全屏 ──

    /** 始终置顶 */
    alwaysOnTop: boolean;
    /** 全屏模式 */
    fullscreen: boolean;

    // ── 视觉 ──

    /** 阴影 */
    shadow: string;

    // ── 焦点 ──

    /** 是否获得焦点 */
    focused: boolean;

    // ── 其他 ──

    /** Tab 键顺序 */
    tabIndex: number;
    /** 层叠顺序 */
    zIndex: number;
}
