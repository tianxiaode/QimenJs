/**
 * BadgeComponent 补充测试
 *
 * 覆盖：onOverlayChange、type、hidden
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { BadgeComponent } from '@/component/badge/BadgeComponent';

describe('BadgeComponent - onOverlayChange', () => {
    it('onOverlayChange 设置 text', () => {
        const badge = new BadgeComponent() as any;
        badge.onOverlayChange({ text: '5' });
        expect(badge.text).toBe('5');
    });

    it('onOverlayChange text 为 0 时 hidden 为 true', () => {
        const badge = new BadgeComponent() as any;
        badge.onOverlayChange({ text: 0 });
        expect(badge.hidden).toBe(true);
    });

    it('onOverlayChange text 非空时 hidden 为 false', () => {
        const badge = new BadgeComponent() as any;
        badge.onOverlayChange({ text: '99+' });
        expect(badge.hidden).toBe(false);
    });

    it('onOverlayChange visible 控制 hidden', () => {
        const badge = new BadgeComponent() as any;
        badge.onOverlayChange({ visible: true });
        expect(badge.hidden).toBe(false);
    });

    it('onOverlayChange visible=false 设置 hidden', () => {
        const badge = new BadgeComponent() as any;
        badge.onOverlayChange({ visible: false });
        expect(badge.hidden).toBe(true);
    });

    it('onOverlayChange null 不报错', () => {
        const badge = new BadgeComponent() as any;
        expect(() => badge.onOverlayChange(null)).not.toThrow();
    });

    it('onOverlayChange undefined 不报错', () => {
        const badge = new BadgeComponent() as any;
        expect(() => badge.onOverlayChange(undefined)).not.toThrow();
    });
});
