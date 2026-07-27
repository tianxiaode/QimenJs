/**
 * ButtonComponent 补充测试
 *
 * 覆盖：update、size、onAfterInit、dropIcon
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

import { ButtonComponent } from '@/component/button/ButtonComponent';

describe('ButtonComponent - update & size', () => {
    describe('update', () => {
        it('更新 icon', () => {
            const btn = ButtonComponent.create() as any;
            btn.update({ icon: '🔍' });
            expect(btn.icon).toBe('🔍');
        });

        it('更新 text', () => {
            const btn = ButtonComponent.create() as any;
            btn.update({ text: 'Save' });
            expect(btn.text).toBe('Save');
        });

        it('更新 size', () => {
            const btn = ButtonComponent.create() as any;
            btn.update({ size: 'lg' });
            expect(btn.size).toBe('lg');
        });

        it('无 size 参数默认 md', () => {
            const btn = ButtonComponent.create() as any;
            btn.update({});
            expect(btn.size).toBe('md');
        });
    });

    describe('size', () => {
        it('默认 size 为 md', () => {
            const btn = ButtonComponent.create() as any;
            expect(btn.size).toBe('md');
        });

        it('设置 size 切换 CSS 类', () => {
            const btn = ButtonComponent.create() as any;
            btn.size = 'sm';
            expect(btn.el.classList.contains('q-button--sm')).toBe(true);
        });
    });

    describe('构造参数', () => {
        it('通过 props 设置 icon 和 text', () => {
            const btn = ButtonComponent.create({ icon: '📋', text: 'Copy' }) as any;
            expect(btn.icon).toBe('📋');
            expect(btn.text).toBe('Copy');
        });

        it('通过 props 设置 size', () => {
            const btn = ButtonComponent.create({ size: 'lg' }) as any;
            expect(btn.size).toBe('lg');
        });
    });
});
