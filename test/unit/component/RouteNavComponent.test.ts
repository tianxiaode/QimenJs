/**
 * RouteNavComponent 单元测试
 *
 * 覆盖：
 * 1. 构造函数（pathIndex、indexPath、type）
 * 2. onNavClick 导航选中切换路由（通过 this.navigate）
 * 3. onRouteChange 路由变化切换高亮
 * 4. update 更新 pathIndex、indexPath
 * 5. dispose
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

import { RouteNavComponent } from '@/component/nav/RouteNavComponent';
import { NavItemComponent } from '@/component/nav/NavItemComponent';
import { ComponentRegistrar, TemplateComponent } from '@qimenjs/component-core';
import { Router } from '@/router/Router';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';

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

describe('RouteNavComponent', () => {
    let router: Router;

    beforeEach(() => {
        (Router as any).instance = null;
        router = Router.getInstance();
        router.clearRoutes();
        router.stop();
    });

    afterEach(() => {
        router.stop();
        router.clearRoutes();
        EventSourceRegistrar.getInstance().clear();
    });

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('type 为 RouteNav', () => {
            const nav = new RouteNavComponent() as any;
            expect(nav.type).toBe('RouteNav');
        });

        it('继承 NavItemGroupComponent 的 q-nav 类', () => {
            const nav = new RouteNavComponent() as any;
            expect(nav.el.classList.contains('q-nav')).toBe(true);
        });

        it('通过 props 初始化 pathIndex 和 indexPath', () => {
            const nav = new RouteNavComponent({
                pathIndex: { '/': 0, '/icons': 1 },
                indexPath: ['/', '/icons'],
                items: [{ text: '首页' }, { text: '图标' }],
            }) as any;

            // 验证 onRouteChange 能正确使用 pathIndex
            expect(nav.activeIndex).toBe(-1);
            nav.onRouteChange({ path: '/' });
            expect(nav.activeIndex).toBe(0);
        });

        it('通过 props 设置初始选中', () => {
            const nav = new RouteNavComponent({
                items: [{ text: '首页' }, { text: '图标' }],
                activeIndex: 0,
            }) as any;
            expect(nav.activeIndex).toBe(0);
        });
    });

    // ============================================
    // onNavClick
    // ============================================

    describe('onNavClick', () => {
        it('导航选中时调用 this.navigate', () => {
            const nav = new RouteNavComponent({
                indexPath: ['/', '/icons', '/theme'],
                items: [{ text: '首页' }, { text: '图标' }, { text: '主题' }],
            }) as any;

            const navigateSpy = jest.spyOn(nav, 'navigate').mockImplementation(() => {});
            nav.onNavClick({ index: 1 });

            expect(navigateSpy).toHaveBeenCalledWith('/icons');
        });

        it('索引越界时不导航', () => {
            const nav = new RouteNavComponent({
                indexPath: ['/', '/icons'],
                items: [{ text: '首页' }, { text: '图标' }],
            }) as any;

            const navigateSpy = jest.spyOn(nav, 'navigate');
            nav.onNavClick({ index: 99 });

            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('无 index 时使用 activeIndex', () => {
            const nav = new RouteNavComponent({
                indexPath: ['/', '/icons'],
                items: [{ text: '首页' }, { text: '图标' }],
                activeIndex: 0,
            }) as any;

            const navigateSpy = jest.spyOn(nav, 'navigate').mockImplementation(() => {});
            nav.onNavClick({});

            expect(navigateSpy).toHaveBeenCalledWith('/');
        });
    });

    // ============================================
    // onRouteChange
    // ============================================

    describe('onRouteChange', () => {
        it('路由变化时切换导航高亮', () => {
            const nav = new RouteNavComponent({
                pathIndex: { '/': 0, '/icons': 1, '/theme': 2 },
                indexPath: ['/', '/icons', '/theme'],
                items: [{ text: '首页' }, { text: '图标' }, { text: '主题' }],
            }) as any;

            nav.onRouteChange({ path: '/icons' });
            expect(nav.activeIndex).toBe(1);
        });

        it('路径不在 pathIndex 中不高亮', () => {
            const nav = new RouteNavComponent({
                pathIndex: { '/': 0 },
                items: [{ text: '首页' }],
            }) as any;

            nav.onRouteChange({ path: '/unknown' });
            expect(nav.activeIndex).toBe(-1);
        });

        it('无 path 时不高亮', () => {
            const nav = new RouteNavComponent({
                pathIndex: { '/': 0 },
                items: [{ text: '首页' }],
            }) as any;

            nav.onRouteChange({});
            expect(nav.activeIndex).toBe(-1);
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('更新 pathIndex', () => {
            const nav = new RouteNavComponent({
                items: [{ text: '首页' }, { text: '图标' }],
            }) as any;

            nav.update({ pathIndex: { '/': 0, '/icons': 1 } });

            // 验证 pathIndex 生效
            nav.onRouteChange({ path: '/icons' });
            expect(nav.activeIndex).toBe(1);
        });

        it('更新 indexPath', () => {
            const nav = new RouteNavComponent({
                items: [{ text: '首页' }, { text: '图标' }],
            }) as any;

            nav.update({ indexPath: ['/', '/icons'] });

            const navigateSpy = jest.spyOn(nav, 'navigate').mockImplementation(() => {});
            nav.onNavClick({ index: 1 });
            expect(navigateSpy).toHaveBeenCalledWith('/icons');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const nav = new RouteNavComponent() as any;
            const el = nav.el;
            nav.dispose();
            expect(document.contains(el)).toBe(false);
        });
    });
});
