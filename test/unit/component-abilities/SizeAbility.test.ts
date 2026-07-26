/**
 * SizeAbility 单元测试
 *
 * 覆盖：initSize、size getter/setter
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
import { SizeAbility } from '@/component-abilities/size/SizeAbility';

const TPL: ComponentTemplate = { tpl: { tag: 'div' } };

describe('SizeAbility', () => {
    // ============================================
    // initSize
    // ============================================

    describe('initSize', () => {
        it('默认尺寸为 md', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize();
            expect(host.size).toBe('md');
        });

        it('添加默认尺寸 CSS 类', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize();
            expect(host.el.classList.contains('q-size--md')).toBe(true);
        });

        it('使用 type 作为类前缀', () => {
            const HostClass = Component.withTemplate({
                tpl: { tag: 'div' },
                body: { type: 'Avatar' },
            }).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize();
            expect(host.el.classList.contains('q-avatar--md')).toBe(true);
        });

        it('自定义默认尺寸', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize({ defaultSize: 'lg' });
            expect(host.size).toBe('lg');
        });

        it('自定义尺寸列表', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize({ sizes: ['sm', 'lg'], defaultSize: 'sm' });
            expect(host.size).toBe('sm');
        });
    });

    // ============================================
    // size setter
    // ============================================

    describe('size setter', () => {
        it('切换尺寸更新 CSS 类', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize();
            host.size = 'lg';
            expect(host.size).toBe('lg');
            expect(host.el.classList.contains('q-size--md')).toBe(false);
            expect(host.el.classList.contains('q-size--lg')).toBe(true);
        });

        it('设置相同值不操作', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            host.initSize();
            host.size = 'md';
            expect(host.el.classList.contains('q-size--md')).toBe(true);
        });

        it('未初始化时设置不报错', () => {
            const HostClass = Component.withTemplate(TPL).with([SizeAbility]);
            const host = new HostClass() as any;
            expect(() => {
                host.size = 'lg';
            }).not.toThrow();
        });
    });
});
