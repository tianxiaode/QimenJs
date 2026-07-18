/**
 * positionOverlay 单元测试
 *
 * 覆盖：各方向定位、自动翻转、视口约束
 */

import { positionOverlay } from '@/overlay/dispatch/positionOverlay';

describe('positionOverlay', () => {
    let anchorEl: HTMLElement;
    let overlayEl: HTMLElement;

    beforeEach(() => {
        anchorEl = document.createElement('div');
        overlayEl = document.createElement('div');

        // 模拟 getBoundingClientRect
        anchorEl.getBoundingClientRect = () =>
            ({
                left: 200,
                top: 200,
                width: 100,
                height: 40,
                right: 300,
                bottom: 240,
                x: 200,
                y: 200,
                toJSON: () => ({}),
            }) as DOMRect;

        overlayEl.getBoundingClientRect = () =>
            ({
                left: 0,
                top: 0,
                width: 80,
                height: 30,
                right: 80,
                bottom: 30,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            }) as DOMRect;

        // 模拟 window
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

        document.body.appendChild(anchorEl);
        document.body.appendChild(overlayEl);
    });

    afterEach(() => {
        anchorEl.remove();
        overlayEl.remove();
    });

    it('placement=bottom → 浮层在锚点下方', () => {
        const result = positionOverlay(overlayEl, anchorEl, 'bottom', 4);
        const top = parseFloat(overlayEl.style.top);
        // anchorRect.y + anchorRect.height + offset = 200 + 40 + 4 = 244
        expect(top).toBe(244);
        expect(result).toBe('bottom');
    });

    it('placement=top → 浮层在锚点上方', () => {
        const result = positionOverlay(overlayEl, anchorEl, 'top', 4);
        const top = parseFloat(overlayEl.style.top);
        // anchorRect.y - overlayHeight - offset = 200 - 30 - 4 = 166
        expect(top).toBe(166);
        expect(result).toBe('top');
    });

    it('placement=right → 浮层在锚点右侧', () => {
        const result = positionOverlay(overlayEl, anchorEl, 'right', 4);
        const left = parseFloat(overlayEl.style.left);
        // anchorRect.x + anchorRect.width + offset = 200 + 100 + 4 = 304
        expect(left).toBe(304);
        expect(result).toBe('right');
    });

    it('placement=left → 浮层在锚点左侧', () => {
        const result = positionOverlay(overlayEl, anchorEl, 'left', 4);
        const left = parseFloat(overlayEl.style.left);
        // anchorRect.x - overlayWidth - offset = 200 - 80 - 4 = 116
        expect(left).toBe(116);
        expect(result).toBe('left');
    });

    it('默认参数 → placement=bottom, offset=4, flip=true', () => {
        positionOverlay(overlayEl, anchorEl);
        const top = parseFloat(overlayEl.style.top);
        expect(top).toBe(244);
    });

    it('flip=true 且超出视口 → 尝试翻转', () => {
        // 锚点在视口底部，bottom 方向会超出
        anchorEl.getBoundingClientRect = () =>
            ({
                left: 200,
                top: 750,
                width: 100,
                height: 40,
                right: 300,
                bottom: 790,
                x: 200,
                y: 750,
                toJSON: () => ({}),
            }) as DOMRect;

        const result = positionOverlay(overlayEl, anchorEl, 'bottom', 4, true);
        // 翻转到 top 方向
        const top = parseFloat(overlayEl.style.top);
        expect(top).toBeLessThan(750);
        expect(result).toBe('top');
    });

    it('flip=false → 不翻转，但 keepInside 仍生效', () => {
        anchorEl.getBoundingClientRect = () =>
            ({
                left: 200,
                top: 750,
                width: 100,
                height: 40,
                right: 300,
                bottom: 790,
                x: 200,
                y: 750,
                toJSON: () => ({}),
            }) as DOMRect;

        positionOverlay(overlayEl, anchorEl, 'bottom', 4, false);
        // 不翻转，但 keepInside 会将位置约束在视口内
        const top = parseFloat(overlayEl.style.top);
        // 794 超出视口高度 768，keepInside 会调整
        expect(top).toBeLessThanOrEqual(768);
    });

    it('offset=0 → 无间距', () => {
        positionOverlay(overlayEl, anchorEl, 'bottom', 0);
        const top = parseFloat(overlayEl.style.top);
        expect(top).toBe(240);
    });
});
