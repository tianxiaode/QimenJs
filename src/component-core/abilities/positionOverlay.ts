/**
 * 浮层定位工具函数
 *
 * 根据锚点元素计算浮层的绝对定位，支持自动翻转和视口约束。
 * 独立于 OverlayAbility，可单独测试和复用。
 */

import type { Rect } from '@/utils/geometry/types';
import { alignLeft, alignRight, alignTop, alignBottom, alignCenterX, alignCenterY } from '@/utils/geometry/align';
import { keepInside } from '@/utils/geometry/clamp';

/**
 * 弹出方向
 */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * 将 HTMLElement 的 getBoundingClientRect 转换为 Rect
 */
function toRect(el: HTMLElement): Rect {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
}

/**
 * 获取视口 Rect
 */
function getViewportRect(): Rect {
    return {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

/**
 * 根据弹出方向计算浮层对齐后的 Rect
 */
function alignByPlacement(
    overlayRect: Rect,
    anchorRect: Rect,
    placement: Placement,
    offset: number,
): Rect {
    let result = overlayRect;

    switch (placement) {
        case 'bottom':
            result = alignCenterX(result, anchorRect);
            result = { ...result, y: anchorRect.y + anchorRect.height + offset };
            break;

        case 'top':
            result = alignCenterX(result, anchorRect);
            result = { ...result, y: anchorRect.y - result.height - offset };
            break;

        case 'right':
            result = alignCenterY(result, anchorRect);
            result = { ...result, x: anchorRect.x + anchorRect.width + offset };
            break;

        case 'left':
            result = alignCenterY(result, anchorRect);
            result = { ...result, x: anchorRect.x - result.width - offset };
            break;
    }

    return result;
}

/**
 * 检测浮层是否超出视口
 */
function isOverflowing(rect: Rect, viewport: Rect): boolean {
    return (
        rect.x < viewport.x ||
        rect.y < viewport.y ||
        rect.x + rect.width > viewport.x + viewport.width ||
        rect.y + rect.height > viewport.y + viewport.height
    );
}

/**
 * 获取翻转方向
 */
function flipPlacement(placement: Placement): Placement {
    const flipMap: Record<Placement, Placement> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
    };
    return flipMap[placement];
}

/**
 * 计算浮层定位并应用到 DOM
 *
 * @param overlayEl - 浮层 DOM 元素
 * @param anchorEl - 锚点 DOM 元素
 * @param placement - 弹出方向
 * @param offset - 浮层与锚点的间距，默认 4
 * @param flip - 是否启用自动翻转，默认 true
 */
export function positionOverlay(
    overlayEl: HTMLElement,
    anchorEl: HTMLElement,
    placement: Placement = 'bottom',
    offset: number = 4,
    flip: boolean = true,
): void {
    const anchorRect = toRect(anchorEl);
    const overlayRect = toRect(overlayEl);
    const viewport = getViewportRect();

    let aligned = alignByPlacement(overlayRect, anchorRect, placement, offset);

    if (flip && isOverflowing(aligned, viewport)) {
        const flippedPlacement = flipPlacement(placement);
        const flipped = alignByPlacement(overlayRect, anchorRect, flippedPlacement, offset);

        if (!isOverflowing(flipped, viewport)) {
            aligned = flipped;
        }
    }

    aligned = keepInside(aligned, viewport);

    overlayEl.style.left = `${aligned.x}px`;
    overlayEl.style.top = `${aligned.y}px`;
}
