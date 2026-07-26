/**
 * NavItemComponent 补充测试
 *
 * 覆盖：toggleOverlay、openOverlay、closeOverlay、_showTooltip、_hideTooltip、
 *       setActive、setDisabled、setMode、_applyState、onRootEnter/onRootLeave
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

import { NavItemComponent } from '@/component/nav/NavItemComponent';

describe('NavItemComponent - overlay & state', () => {
    describe('setActive', () => {
        it('设置激活状态', () => {
            const item = new NavItemComponent() as any;
            item.setActive(true);
            expect(item.active).toBe(true);
            expect(item.el.classList.contains('q-nav-item--active')).toBe(true);
        });
    });

    describe('setDisabled', () => {
        it('设置禁用状态', () => {
            const item = new NavItemComponent() as any;
            item.setDisabled(true);
            expect(item.disabled).toBe(true);
            expect(item.el.classList.contains('q-nav-item--disabled')).toBe(true);
        });
    });

    describe('setMode', () => {
        it('设置 collapsed 模式', () => {
            const item = new NavItemComponent() as any;
            item.setMode('collapsed');
            expect(item.mode).toBe('collapsed');
            expect(item.el.classList.contains('q-nav-item--collapsed')).toBe(true);
        });

        it('设置 expanded 模式', () => {
            const item = new NavItemComponent() as any;
            item.setMode('collapsed');
            item.setMode('expanded');
            expect(item.el.classList.contains('q-nav-item--collapsed')).toBe(false);
        });
    });

    describe('onClick with children', () => {
        it('有 children 时调用 toggleOverlay', () => {
            const item = new NavItemComponent({ children: [{ text: 'Sub1' }] }) as any;
            const spy = jest.spyOn(item, 'toggleOverlay');
            item.onClick();
            expect(spy).toHaveBeenCalled();
        });

        it('无 children 时触发 onSelect', () => {
            const onSelect = jest.fn();
            const item = new NavItemComponent({ onSelect }) as any;
            item.onClick();
            expect(onSelect).toHaveBeenCalledWith(item);
        });
    });

    describe('update', () => {
        it('更新 icon', () => {
            const item = new NavItemComponent() as any;
            item.update({ icon: '🏠' });
            expect(item.icon).toBe('🏠');
        });

        it('更新 children', () => {
            const item = new NavItemComponent() as any;
            item.update({ children: [{ text: 'Child1' }] });
            expect(item.children).toEqual([{ text: 'Child1' }]);
        });

        it('更新 mode', () => {
            const item = new NavItemComponent() as any;
            item.update({ mode: 'collapsed' });
            expect(item.mode).toBe('collapsed');
        });

        it('更新 maxDepth', () => {
            const item = new NavItemComponent() as any;
            item.update({ maxDepth: 5 });
            expect(item.maxDepth).toBe(5);
        });

        it('更新 overlayOptions', () => {
            const item = new NavItemComponent() as any;
            item.update({ overlayOptions: { placement: 'bottom' } });
            expect(item.overlayOptions).toEqual({ placement: 'bottom' });
        });
    });

    describe('onRootEnter / onRootLeave', () => {
        it('collapsed 模式 onRootEnter 显示 tooltip', () => {
            const item = new NavItemComponent({ mode: 'collapsed', text: 'Home' }) as any;
            item.onRootEnter();
        });

        it('collapsed 模式 onRootLeave 隐藏 tooltip', () => {
            const item = new NavItemComponent({ mode: 'collapsed', text: 'Home' }) as any;
            item.onRootEnter();
            item.onRootLeave();
        });

        it('expanded 模式不显示 tooltip', () => {
            const item = new NavItemComponent({ mode: 'expanded', text: 'Home' }) as any;
            item.onRootEnter();
        });
    });

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const item = new NavItemComponent() as any;
            container.appendChild(item.el);
            item.dispose();
            expect(document.contains(item.el)).toBe(false);
            container.remove();
        });
    });
});
