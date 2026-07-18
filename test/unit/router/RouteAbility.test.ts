/**
 * RouteAbility 单元测试
 *
 * 覆盖：
 * 1. _handleRouteChange 附加 routeName
 * 2. _handleRouteChange emit route:change
 * 3. setupRoute 注册路由并启动监听
 * 4. _initRoute 从 props.route 自动初始化
 */

import { TemplateComponent } from '@qimenjs/component-core';
import type { ComponentTemplate } from '@qimenjs/component-core';
import { RouteAbility } from '@/router/RouteAbility';
import { Router } from '@/router/Router';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';

// 创建带 RouteAbility 的宿主组件
function createHost(overrides?: Record<string, any>) {
    const HostClass = TemplateComponent.withTemplate({
        tpl: { tag: 'div' },
    } as ComponentTemplate).with([RouteAbility]);
    return new HostClass(overrides) as any;
}

describe('RouteAbility', () => {
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
    // _handleRouteChange
    // ============================================

    describe('_handleRouteChange', () => {
        it('附加 routeName 到事件', () => {
            const host = createHost();
            host.setupRoute({ routes: { '/': 'home', '/about': 'about' }, hashMode: true });

            const event = { path: '/', previousPath: null, params: {} };
            host._handleRouteChange(event);

            expect((event as any).routeName).toBe('home');
        });

        it('路径不在路由配置中时不附加 routeName', () => {
            const host = createHost();
            host.setupRoute({ routes: { '/': 'home' }, hashMode: true });

            const event = { path: '/unknown', previousPath: null, params: {} };
            host._handleRouteChange(event);

            expect((event as any).routeName).toBeUndefined();
        });

        it('emit route:change 事件', () => {
            const host = createHost();
            host.setupRoute({ routes: { '/': 'home' }, hashMode: true });

            const emitSpy = jest.spyOn(host, 'emit');
            const event = { path: '/', previousPath: null, params: {} };
            host._handleRouteChange(event);

            expect(emitSpy).toHaveBeenCalledWith('route:change', event);
        });

        it('routeName 值来自路由配置', () => {
            const host = createHost();
            host.setupRoute({ routes: { '/icons': 'icons' }, hashMode: true });

            const event = { path: '/icons', previousPath: null, params: {} };
            host._handleRouteChange(event);

            expect((event as any).routeName).toBe('icons');
        });
    });

    // ============================================
    // setupRoute
    // ============================================

    describe('setupRoute', () => {
        it('注册路由并启动 Router', () => {
            const host = createHost();
            const registerSpy = jest.spyOn(router, 'register');
            const startSpy = jest.spyOn(router, 'start');

            host.setupRoute({
                routes: { '/': 'home' },
                hashMode: true,
            });

            expect(registerSpy).toHaveBeenCalledWith({ '/': 'home' });
            expect(startSpy).toHaveBeenCalledWith(true);
        });

        it('保存路由配置到 _routeConfig', () => {
            const host = createHost();
            host.setupRoute({ routes: { '/': 'home' }, hashMode: true });

            expect(host._routeConfig).toBeDefined();
            expect(host._routeConfig.routes).toEqual({ '/': 'home' });
        });
    });

    // ============================================
    // _initRoute
    // ============================================

    describe('_initRoute', () => {
        it('从 props.route 自动调用 setupRoute', () => {
            const routeConfig = { routes: { '/': 'home' } as any, hashMode: true };
            const HostClass = TemplateComponent.withTemplate({
                tpl: { tag: 'div' },
            } as ComponentTemplate).with([RouteAbility]);
            const host = new HostClass({ route: routeConfig }) as any;

            expect(host._routeConfig).toBeDefined();
            expect(host._routeConfig.routes).toEqual({ '/': 'home' });
        });

        it('无 props.route 时不调用 setupRoute', () => {
            const host = createHost();
            expect(host._routeConfig).toBeNull();
        });
    });
});
