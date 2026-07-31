/**
 * NavItemGroupComponent 单元测试
 *
 * 覆盖：构造函数、选中态管理（selectAt/clearSelection/activeIndex）、update、dispose
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

import { NavItemGroupComponent } from '@/component/nav/NavComponent';
import { NavItemComponent } from '@/component/nav/NavItemComponent';
import { ComponentRegistrar, TemplateComponent } from '@qimenjs/component-core';

// 注册 NavItem 组件
beforeAll(() => {
    const registrar = ComponentRegistrar.getInstance();
    if (!registrar.get('NavItem')) {
        registrar.register('NavItem', NavItemComponent);
    }
    if (!registrar.get('Icon')) {
        class MockIcon extends TemplateComponent { type = 'Icon'; tag = 'i'; }
        registrar.register('Icon', MockIcon);
    }
});

describe('NavItemGroupComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('创建 el 并添加 q-nav 类', () => {
            const nav = new NavItemGroupComponent() as any;
            expect(nav.el).toBeInstanceOf(HTMLElement);
            expect(nav.el.classList.contains('q-nav')).toBe(true);
        });

        it('type 为 NavItemGroup', () => {
            const nav = new NavItemGroupComponent() as any;
            expect(nav.type).toBe('NavItemGroup');
        });

        it('默认水平方向', () => {
            const nav = new NavItemGroupComponent() as any;
            expect(nav.direction).toBe('horizontal');
        });

        it('通过 props 设置垂直方向', () => {
            const nav = new NavItemGroupComponent({ direction: 'vertical' }) as any;
            expect(nav.direction).toBe('vertical');
        });

        it('通过 props 初始化子项', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
            }) as any;
            expect(nav.count).toBe(2);
        });

        it('默认无选中', () => {
            const nav = new NavItemGroupComponent() as any;
            expect(nav.activeIndex).toBe(-1);
        });

        it('通过 props 设置初始选中', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
                activeIndex: 0,
            }) as any;
            expect(nav.activeIndex).toBe(0);
            expect(nav.items[0].active).toBe(true);
        });
    });

    // ============================================
    // 选中态管理
    // ============================================

    describe('选中态管理', () => {
        it('selectAt 选中指定项', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
            }) as any;
            nav.selectAt(1);
            expect(nav.activeIndex).toBe(1);
            expect(nav.items[1].active).toBe(true);
        });

        it('selectAt 取消前一项选中', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
                activeIndex: 0,
            }) as any;
            expect(nav.items[0].active).toBe(true);
            nav.selectAt(1);
            expect(nav.items[0].active).toBe(false);
            expect(nav.items[1].active).toBe(true);
        });

        it('selectAt 相同索引不重复操作', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
                activeIndex: 0,
            }) as any;
            nav.selectAt(0);
            expect(nav.activeIndex).toBe(0);
        });

        it('selectAt 越界索引无效', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }],
            }) as any;
            nav.selectAt(5);
            expect(nav.activeIndex).toBe(-1);
        });

        it('clearSelection 清除选中', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
                activeIndex: 0,
            }) as any;
            nav.clearSelection();
            expect(nav.activeIndex).toBe(-1);
            expect(nav.items[0].active).toBe(false);
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('更新 activeIndex', () => {
            const nav = new NavItemGroupComponent({
                items: [{ text: '首页' }, { text: '设置' }],
            }) as any;
            nav.update({ activeIndex: 1 });
            expect(nav.activeIndex).toBe(1);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const nav = new NavItemGroupComponent() as any;
            const el = nav.el;
            nav.dispose();
            expect(document.contains(el)).toBe(false);
        });
    });
});
