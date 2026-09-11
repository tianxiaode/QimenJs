/**
 * 浮层定位工具函数
 *
 * 根据锚点元素计算浮层的绝对定位，支持自动翻转和视口约束。
 * 独立于 OverlayAbility，可单独测试和复用。
 */

import type { Rect } from '@/utils/geometry';
import {
    alignCenterX,
    alignCenterY,
    keepInside,
    alignLeft,
    alignRight,
    alignTop,
    alignBottom,
} from '@/utils/geometry';

/**
 * 弹出方向
 */
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'anchor-center';

export type Align = 'start' | 'center' | 'end';

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
    placement: 'top' | 'bottom' | 'left' | 'right',
    offset: number,
    align: Align = 'center'
): Rect {
    let result = overlayRect;

    switch (placement) {
        case 'bottom':
            result = align === 'start' ? alignLeft(result, anchorRect)
                : align === 'end' ? alignRight(result, anchorRect)
                : alignCenterX(result, anchorRect);
            result = { ...result, y: anchorRect.y + anchorRect.height + offset };
            break;

        case 'top':
            result = align === 'start' ? alignLeft(result, anchorRect)
                : align === 'end' ? alignRight(result, anchorRect)
                : alignCenterX(result, anchorRect);
            result = { ...result, y: anchorRect.y - result.height - offset };
            break;

        case 'right':
            result = align === 'start' ? alignTop(result, anchorRect)
                : align === 'end' ? alignBottom(result, anchorRect)
                : alignCenterY(result, anchorRect);
            result = { ...result, x: anchorRect.x + anchorRect.width + offset };
            break;

        case 'left':
            result = align === 'start' ? alignTop(result, anchorRect)
                : align === 'end' ? alignBottom(result, anchorRect)
                : alignCenterY(result, anchorRect);
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
function flipPlacement(
    placement: 'top' | 'bottom' | 'left' | 'right'
): 'top' | 'bottom' | 'left' | 'right' {
    const flipMap: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
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
 * @returns 实际使用的 placement（flip 后可能改变）
 */
export function positionOverlay(
    overlayEl: HTMLElement,
    anchorEl: HTMLElement,
    placement: Placement = 'bottom',
    offset: number = 4,
    flip: boolean = true,
    align: Align = 'center'
): Placement {
    const anchorRect = toRect(anchorEl);
    const overlayRect = toRect(overlayEl);
    const viewport = getViewportRect();

    if (placement === 'center') {
        overlayEl.style.position = 'fixed';
        overlayEl.style.top = '50%';
        overlayEl.style.left = '50%';
        overlayEl.style.transform = 'translate(-50%, -50%)';
        return 'center';
    }

    if (placement === 'anchor-center') {
        overlayEl.style.position = 'fixed';
        overlayEl.style.top = `${anchorRect.y + anchorRect.height / 2}px`;
        overlayEl.style.left = `${anchorRect.x + anchorRect.width / 2}px`;
        overlayEl.style.transform = 'translate(-50%, -50%)';
        return 'anchor-center';
    }

    type AnchorPlacement = 'top' | 'bottom' | 'left' | 'right';
    const anchorPlacement = placement as AnchorPlacement;
    let actualPlacement: AnchorPlacement = anchorPlacement;
    let aligned = alignByPlacement(overlayRect, anchorRect, anchorPlacement, offset, align);

    if (flip && isOverflowing(aligned, viewport)) {
        const flippedPlacement = flipPlacement(anchorPlacement);
        const flipped = alignByPlacement(overlayRect, anchorRect, flippedPlacement, offset, align);

        if (!isOverflowing(flipped, viewport)) {
            aligned = flipped;
            actualPlacement = flippedPlacement;
        }
    }

    // 智能调整对齐方式，避免浮层被截断
    if (anchorPlacement === 'top' || anchorPlacement === 'bottom') {
        if (aligned.x < viewport.x) {
            aligned = alignLeft(aligned, anchorRect);
        } else if (aligned.x + aligned.width > viewport.x + viewport.width) {
            aligned = alignRight(aligned, anchorRect);
        }
    } else {
        if (aligned.y < viewport.y) {
            aligned = alignTop(aligned, anchorRect);
        } else if (aligned.y + aligned.height > viewport.y + viewport.height) {
            aligned = alignBottom(aligned, anchorRect);
        }
    }

    aligned = keepInside(aligned, viewport);

    overlayEl.style.left = `${aligned.x}px`;
    overlayEl.style.top = `${aligned.y}px`;

    return actualPlacement;
}
