/**
 * AnimationAbility 单元测试
 *
 * 覆盖：play、animate
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

import { Component } from '@/component-core';
import type { ComponentTemplate } from '@/component-core';
import { AnimationAbility } from '@/component-abilities/render/AnimationAbility';

const TPL: ComponentTemplate = { tpl: { tag: 'div' } };
const HostClass = Component.withTemplate(TPL).with([AnimationAbility]);

describe('AnimationAbility', () => {
    describe('play', () => {
        it('有 el.animate 时播放动画', () => {
            const host = new HostClass() as any;
            const mockAnim = { finished: Promise.resolve() };
            host.el.animate = jest.fn().mockReturnValue(mockAnim);
            const anim = host.play('fadeIn');
            expect(anim).toBe(mockAnim);
            expect(host.el.animate).toHaveBeenCalled();
        });

        it('传入自定义选项', () => {
            const host = new HostClass() as any;
            const mockAnim = { finished: Promise.resolve() };
            host.el.animate = jest.fn().mockReturnValue(mockAnim);
            const anim = host.play('fadeIn', { duration: 500, easing: 'linear', fill: 'both' });
            expect(anim).toBe(mockAnim);
        });

        it('无 el 时返回 undefined', () => {
            const host = new HostClass() as any;
            host.el = null;
            expect(host.play('fadeIn')).toBeUndefined();
        });

        it('el 无 animate 方法时返回 undefined', () => {
            const host = new HostClass() as any;
            host.el.animate = undefined;
            expect(host.play('fadeIn')).toBeUndefined();
        });
    });

    describe('animate', () => {
        it('有 el.animate 时播放关键帧动画', () => {
            const host = new HostClass() as any;
            const mockAnim = { finished: Promise.resolve() };
            host.el.animate = jest.fn().mockReturnValue(mockAnim);
            const keyframes = [
                { opacity: 0, transform: 'translateX(-10px)' },
                { opacity: 1, transform: 'translateX(0)' },
            ];
            const anim = host.animate(keyframes, { duration: 300 });
            expect(anim).toBe(mockAnim);
        });

        it('无 el 时返回 undefined', () => {
            const host = new HostClass() as any;
            host.el = null;
            expect(host.animate([])).toBeUndefined();
        });
    });
});
