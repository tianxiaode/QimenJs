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
    // ============================================
    // play
    // ============================================

    describe('play', () => {
        it('播放动画返回 Animation 实例', () => {
            const host = new HostClass() as any;
            const anim = host.play('fadeIn');
            expect(anim).toBeTruthy();
        });

        it('传入自定义选项', () => {
            const host = new HostClass() as any;
            const anim = host.play('fadeIn', { duration: 500, easing: 'linear', fill: 'both' });
            expect(anim).toBeTruthy();
        });

        it('无 el 时返回 undefined', () => {
            const host = new HostClass() as any;
            host.el = null;
            expect(host.play('fadeIn')).toBeUndefined();
        });
    });

    // ============================================
    // animate
    // ============================================

    describe('animate', () => {
        it('播放关键帧动画', () => {
            const host = new HostClass() as any;
            const keyframes = [
                { opacity: 0, transform: 'translateX(-10px)' },
                { opacity: 1, transform: 'translateX(0)' },
            ];
            const anim = host.animate(keyframes, { duration: 300 });
            expect(anim).toBeTruthy();
        });

        it('无 el 时返回 undefined', () => {
            const host = new HostClass() as any;
            host.el = null;
            expect(host.animate([])).toBeUndefined();
        });
    });
});
