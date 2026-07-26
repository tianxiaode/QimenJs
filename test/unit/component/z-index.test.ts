/**
 * z-index 单元测试
 *
 * 覆盖：ZIndexLevel、nextZIndex、releaseZIndex
 */

import { ZIndexLevel, nextZIndex, releaseZIndex } from '@/component/z-index';

describe('z-index', () => {
    // ============================================
    // ZIndexLevel
    // ============================================

    describe('ZIndexLevel', () => {
        it('包含预定义层级', () => {
            expect(ZIndexLevel.mask).toBe(1040);
            expect(ZIndexLevel.dropdown).toBe(1050);
            expect(ZIndexLevel.modal).toBe(1060);
            expect(ZIndexLevel.notification).toBe(1070);
            expect(ZIndexLevel.tooltip).toBe(1080);
        });
    });

    // ============================================
    // nextZIndex
    // ============================================

    describe('nextZIndex', () => {
        it('首次调用返回 level + 10', () => {
            const z = nextZIndex(ZIndexLevel.dropdown);
            expect(z).toBeGreaterThanOrEqual(ZIndexLevel.dropdown + 10);
        });

        it('连续调用递增', () => {
            const z1 = nextZIndex(ZIndexLevel.modal);
            const z2 = nextZIndex(ZIndexLevel.modal);
            expect(z2).toBe(z1 + 10);
        });

        it('不同层级独立计数', () => {
            const z1 = nextZIndex(ZIndexLevel.tooltip);
            const z2 = nextZIndex(ZIndexLevel.dropdown);
            expect(z2).toBeGreaterThanOrEqual(ZIndexLevel.dropdown + 10);
        });
    });

    // ============================================
    // releaseZIndex
    // ============================================

    describe('releaseZIndex', () => {
        it('释放后下次 nextZIndex 返回更小值', () => {
            const z1 = nextZIndex(ZIndexLevel.notification);
            releaseZIndex(ZIndexLevel.notification);
            const z2 = nextZIndex(ZIndexLevel.notification);
            expect(z2).toBeLessThanOrEqual(z1 + 10);
        });

        it('不释放到低于 level', () => {
            releaseZIndex(ZIndexLevel.mask);
            releaseZIndex(ZIndexLevel.mask);
            releaseZIndex(ZIndexLevel.mask);
            const z = nextZIndex(ZIndexLevel.mask);
            expect(z).toBeGreaterThanOrEqual(ZIndexLevel.mask + 10);
        });
    });
});
