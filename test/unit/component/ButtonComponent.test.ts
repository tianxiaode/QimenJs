/**
 * ButtonComponent 单元测试
 *
 * 覆盖：构造函数、setText、setDisabled、applyType、applySize、
 *       applyDisabled、dispose
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

import { ButtonComponent } from '@/component/button/ButtonComponent';

describe('ButtonComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-button 类', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.el).toBeInstanceOf(HTMLElement);
            expect(btn.el.classList.contains('q-button')).toBe(true);
        });

        it('默认类型为 default', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.el.classList.contains('q-button--default')).toBe(true);
        });

        it('默认尺寸为 medium', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.el.classList.contains('q-button--medium')).toBe(true);
        });

        it('默认不禁用', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.el.classList.contains('q-button--disabled')).toBe(false);
            expect(btn.el.hasAttribute('disabled')).toBe(false);
        });

        it('props.type 设置按钮类型', () => {
            const btn = new ButtonComponent({ type: 'primary' }) as any;
            expect(btn.el.classList.contains('q-button--primary')).toBe(true);
            expect(btn.el.classList.contains('q-button--default')).toBe(false);
        });

        it('props.size 设置按钮尺寸', () => {
            const btn = new ButtonComponent({ size: 'large' }) as any;
            expect(btn.el.classList.contains('q-button--large')).toBe(true);
            expect(btn.el.classList.contains('q-button--medium')).toBe(false);
        });

        it('props.disabled 设置禁用状态', () => {
            const btn = new ButtonComponent({ disabled: true }) as any;
            expect(btn.el.classList.contains('q-button--disabled')).toBe(true);
            expect(btn.el.hasAttribute('disabled')).toBe(true);
        });

        it('props.text 设置初始文本', () => {
            const btn = new ButtonComponent({ text: 'Click' }) as any;
            expect(btn.default).toBe('Click');
        });

        it('props.text 为数字时转为字符串', () => {
            const btn = new ButtonComponent({ text: 42 }) as any;
            expect(btn.default).toBe('42');
        });

        it('无 props.text 时不设置文本', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.default).toBeUndefined();
        });
    });

    // ============================================
    // setText
    // ============================================

    describe('setText', () => {
        it('设置文本内容', () => {
            const btn = new ButtonComponent() as any;
            btn.setText('Submit');
            expect(btn.default).toBe('Submit');
        });

        it('数字转为字符串', () => {
            const btn = new ButtonComponent() as any;
            btn.setText(10);
            expect(btn.default).toBe('10');
        });

        it('0 转为 "0"', () => {
            const btn = new ButtonComponent() as any;
            btn.setText(0);
            expect(btn.default).toBe('0');
        });
    });

    // ============================================
    // setDisabled
    // ============================================

    describe('setDisabled', () => {
        it('true → 添加 disabled 类和属性', () => {
            const btn = new ButtonComponent() as any;
            btn.setDisabled(true);
            expect(btn.el.classList.contains('q-button--disabled')).toBe(true);
            expect(btn.el.hasAttribute('disabled')).toBe(true);
        });

        it('false → 移除 disabled 类和属性', () => {
            const btn = new ButtonComponent({ disabled: true }) as any;
            btn.setDisabled(false);
            expect(btn.el.classList.contains('q-button--disabled')).toBe(false);
            expect(btn.el.hasAttribute('disabled')).toBe(false);
        });

        it('切换禁用状态', () => {
            const btn = new ButtonComponent() as any;
            btn.setDisabled(true);
            expect(btn.el.classList.contains('q-button--disabled')).toBe(true);
            btn.setDisabled(false);
            expect(btn.el.classList.contains('q-button--disabled')).toBe(false);
        });
    });

    // ============================================
    // applyType
    // ============================================

    describe('applyType', () => {
        it('default 类型', () => {
            const btn = new ButtonComponent({ type: 'default' }) as any;
            expect(btn.el.classList.contains('q-button--default')).toBe(true);
            expect(btn.el.classList.contains('q-button--primary')).toBe(false);
        });

        it('primary 类型', () => {
            const btn = new ButtonComponent({ type: 'primary' }) as any;
            expect(btn.el.classList.contains('q-button--primary')).toBe(true);
            expect(btn.el.classList.contains('q-button--default')).toBe(false);
        });

        it('success 类型', () => {
            const btn = new ButtonComponent({ type: 'success' }) as any;
            expect(btn.el.classList.contains('q-button--success')).toBe(true);
            expect(btn.el.classList.contains('q-button--default')).toBe(false);
        });

        it('warning 类型', () => {
            const btn = new ButtonComponent({ type: 'warning' }) as any;
            expect(btn.el.classList.contains('q-button--warning')).toBe(true);
            expect(btn.el.classList.contains('q-button--default')).toBe(false);
        });

        it('danger 类型', () => {
            const btn = new ButtonComponent({ type: 'danger' }) as any;
            expect(btn.el.classList.contains('q-button--danger')).toBe(true);
            expect(btn.el.classList.contains('q-button--default')).toBe(false);
        });
    });

    // ============================================
    // applySize
    // ============================================

    describe('applySize', () => {
        it('small 尺寸', () => {
            const btn = new ButtonComponent({ size: 'small' }) as any;
            expect(btn.el.classList.contains('q-button--small')).toBe(true);
            expect(btn.el.classList.contains('q-button--medium')).toBe(false);
        });

        it('medium 尺寸', () => {
            const btn = new ButtonComponent({ size: 'medium' }) as any;
            expect(btn.el.classList.contains('q-button--medium')).toBe(true);
            expect(btn.el.classList.contains('q-button--small')).toBe(false);
        });

        it('large 尺寸', () => {
            const btn = new ButtonComponent({ size: 'large' }) as any;
            expect(btn.el.classList.contains('q-button--large')).toBe(true);
            expect(btn.el.classList.contains('q-button--medium')).toBe(false);
        });
    });

    // ============================================
    // applyDisabled
    // ============================================

    describe('applyDisabled', () => {
        it('禁用时添加类和属性', () => {
            const btn = new ButtonComponent({ disabled: true }) as any;
            expect(btn.el.classList.contains('q-button--disabled')).toBe(true);
            expect(btn.el.getAttribute('disabled')).toBe('');
        });

        it('非禁用时无类和属性', () => {
            const btn = new ButtonComponent() as any;
            expect(btn.el.classList.contains('q-button--disabled')).toBe(false);
            expect(btn.el.hasAttribute('disabled')).toBe(false);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const btn = new ButtonComponent() as any;
            container.appendChild(btn.el);
            expect(container.contains(btn.el)).toBe(true);
            btn.dispose();
            expect(document.contains(btn.el)).toBe(false);
            container.remove();
        });
    });
});
