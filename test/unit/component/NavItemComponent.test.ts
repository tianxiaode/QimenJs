/**
 * NavItemComponent 单元测试
 *
 * 覆盖：构造函数、内容属性、active/disabled 状态、onClick、update、dispose
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

import { NavItemComponent } from '@/component/nav/NavItemComponent';

describe('NavItemComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-nav-item 类', () => {
            const item = new NavItemComponent() as any;
            expect(item.el).toBeInstanceOf(HTMLElement);
            expect(item.el.classList.contains('q-nav-item')).toBe(true);
        });

        it('type 为 NavItem', () => {
            const item = new NavItemComponent() as any;
            expect(item.type).toBe('NavItem');
        });

        it('通过 props 设置文本', () => {
            const item = new NavItemComponent({ text: '首页' }) as any;
            expect(item.text).toBe('首页');
        });

        it('通过 props 设置图标', () => {
            const item = new NavItemComponent({ icon: '🏠' }) as any;
            expect(item.icon).toBe('🏠');
        });

        it('默认不激活', () => {
            const item = new NavItemComponent() as any;
            expect(item.active).toBe(false);
        });

        it('通过 props 设置激活', () => {
            const item = new NavItemComponent({ active: true }) as any;
            expect(item.active).toBe(true);
            expect(item.el.classList.contains('q-nav-item--active')).toBe(true);
        });

        it('默认不禁用', () => {
            const item = new NavItemComponent() as any;
            expect(item.disabled).toBe(false);
        });

        it('通过 props 设置禁用', () => {
            const item = new NavItemComponent({ disabled: true }) as any;
            expect(item.disabled).toBe(true);
            expect(item.el.classList.contains('q-nav-item--disabled')).toBe(true);
        });
    });

    // ============================================
    // active 状态
    // ============================================

    describe('active', () => {
        it('setter 切换激活状态', () => {
            const item = new NavItemComponent() as any;
            item.active = true;
            expect(item.el.classList.contains('q-nav-item--active')).toBe(true);
            expect(item.el.getAttribute('aria-current')).toBe('page');
        });

        it('取消激活移除 aria-current', () => {
            const item = new NavItemComponent({ active: true }) as any;
            item.active = false;
            expect(item.el.classList.contains('q-nav-item--active')).toBe(false);
            expect(item.el.hasAttribute('aria-current')).toBe(false);
        });
    });

    // ============================================
    // disabled 状态
    // ============================================

    describe('disabled', () => {
        it('setter 切换禁用状态', () => {
            const item = new NavItemComponent() as any;
            item.disabled = true;
            expect(item.el.classList.contains('q-nav-item--disabled')).toBe(true);
            expect(item.el.getAttribute('aria-disabled')).toBe('true');
        });

        it('取消禁用移除 aria-disabled', () => {
            const item = new NavItemComponent({ disabled: true }) as any;
            item.disabled = false;
            expect(item.el.classList.contains('q-nav-item--disabled')).toBe(false);
            expect(item.el.hasAttribute('aria-disabled')).toBe(false);
        });
    });

    // ============================================
    // onClick
    // ============================================

    describe('onClick', () => {
        it('正常点击触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new NavItemComponent({ onSelect }) as any;
            item.onClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });

        it('禁用时不触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new NavItemComponent({ disabled: true, onSelect }) as any;
            item.onClick();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('有 eventKey 时触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new NavItemComponent({ onSelect, eventKey: 'nav' }) as any;
            item.onClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });

        it('无 eventKey 时 onClick 仍触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new NavItemComponent({ onSelect }) as any;
            item.onClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('更新文本', () => {
            const item = new NavItemComponent() as any;
            item.update({ text: '设置' });
            expect(item.text).toBe('设置');
        });

        it('更新激活状态', () => {
            const item = new NavItemComponent() as any;
            item.update({ active: true });
            expect(item.active).toBe(true);
        });

        it('更新禁用状态', () => {
            const item = new NavItemComponent() as any;
            item.update({ disabled: true });
            expect(item.disabled).toBe(true);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const item = new NavItemComponent() as any;
            container.appendChild(item.el);
            expect(container.contains(item.el)).toBe(true);
            item.dispose();
            expect(document.contains(item.el)).toBe(false);
            container.remove();
        });
    });
});
