/**
 * Router 单元测试
 *
 * 覆盖：
 * 1. pathToEventName 路径转事件名
 * 2. Router 单例
 * 3. 路由注册和导航
 * 4. 路由守卫
 * 5. 动态路由匹配
 * 6. RouteEventBus 双向交互（switch → navigate → change）
 */

import { Router, pathToEventName } from '@/router/Router';
import { RouteEventBus } from '@/events/RouteEventBus';
import { EventContextBuilder } from '@/context';

describe('pathToEventName', () => {
    it('根路径 / 转换为空字符串', () => {
        // split('/') → ['', ''] → filter(Boolean) → [] → join(':') → ''
        expect(pathToEventName('/')).toBe('');
    });

    it('/users 转换为 users', () => {
        expect(pathToEventName('/users')).toBe('users');
    });

    it('/users/list 转换为 users:list', () => {
        expect(pathToEventName('/users/list')).toBe('users:list');
    });

    it('空字符串返回空', () => {
        expect(pathToEventName('')).toBe('');
    });

    it('尾部斜杠被过滤', () => {
        expect(pathToEventName('/users/')).toBe('users');
    });
});

describe('Router', () => {
    let router: Router;

    beforeEach(() => {
        // 重置单例
        (Router as any).instance = null;
        router = Router.getInstance();
        router.clearRoutes();
        router.stop();
    });

    afterEach(() => {
        router.stop();
        router.clearRoutes();
    });

    describe('单例', () => {
        it('getInstance 返回同一实例', () => {
            const r1 = Router.getInstance();
            const r2 = Router.getInstance();
            expect(r1).toBe(r2);
        });
    });

    describe('路由注册', () => {
        it('register 注册路由字典', () => {
            router.register({ '/': 'HomePage', '/users': 'UserPage' });
            expect(router.getPath()).toBeNull();
        });

        it('clearRoutes 清空路由字典', () => {
            router.register({ '/': 'HomePage' });
            router.clearRoutes();
            // 无断言异常即通过
        });
    });

    describe('路由守卫', () => {
        it('守卫返回 false 阻止导航', () => {
            const guard = jest.fn(() => false);
            router.addGuard(guard);
            router.register({ '/home': 'HomePage' });

            // navigate 被守卫阻止
            router.navigate('/home');
            expect(guard).toHaveBeenCalledWith(null, '/home');
            expect(router.getPath()).toBeNull();
        });

        it('守卫返回 true 允许导航', () => {
            const guard = jest.fn(() => true);
            router.addGuard(guard);
            router.register({ '/home': 'HomePage' });

            router.navigate('/home');
            expect(guard).toHaveBeenCalled();
            expect(router.getPath()).toBe('/home');
        });

        it('removeGuard 移除守卫', () => {
            const guard = jest.fn(() => false);
            router.addGuard(guard);
            router.removeGuard(guard);
            router.register({ '/home': 'HomePage' });

            router.navigate('/home');
            expect(router.getPath()).toBe('/home');
        });
    });

    describe('动态路由匹配', () => {
        it('matchPattern 匹配动态参数', () => {
            router.register({ '/users/:id': 'UserDetail' });
            const params = router.matchPattern('/users/:id', '/users/123');
            expect(params).toEqual({ id: '123' });
        });

        it('matchPattern 不匹配时返回 null', () => {
            const params = router.matchPattern('/users/:id', '/posts/123');
            expect(params).toBeNull();
        });

        it('matchPattern 长度不同返回 null', () => {
            const params = router.matchPattern('/users/:id', '/users/123/profile');
            expect(params).toBeNull();
        });

        it('matchPattern 多个动态参数', () => {
            const params = router.matchPattern('/users/:userId/posts/:postId', '/users/1/posts/42');
            expect(params).toEqual({ userId: '1', postId: '42' });
        });
    });

    describe('导航', () => {
        it('navigate 更新当前路径', () => {
            router.register({ '/home': 'HomePage' });
            router.navigate('/home');
            expect(router.getPath()).toBe('/home');
        });

        it('连续导航更新路径', () => {
            router.register({ '/home': 'HomePage', '/about': 'AboutPage' });
            router.navigate('/home');
            expect(router.getPath()).toBe('/home');
            router.navigate('/about');
            expect(router.getPath()).toBe('/about');
        });

        it('navigate with replace in hash mode', () => {
            router.register({ '/home': 'HomePage' });
            router.navigate('/home', true);
            expect(router.getPath()).toBe('/home');
        });

        it('navigate with replace in history mode', () => {
            router.register({ '/home': 'HomePage' });
            (router as any).hashMode = false;
            router.navigate('/home', true);
            expect(router.getPath()).toBe('/home');
        });

        it('navigate with push in history mode', () => {
            router.register({ '/home': 'HomePage' });
            (router as any).hashMode = false;
            router.navigate('/home', false);
            expect(router.getPath()).toBe('/home');
        });
    });

    describe('RouteEventBus', () => {
        it('Router 通过 RouteEventBus 发送 change 事件', () => {
            const bus = RouteEventBus.getInstance();
            const received: any[] = [];
            bus.routeOn('router', 'change', (data: any) => {
                received.push(data);
            });

            router.register({ '/home': 'HomePage' });
            router.navigate('/home');

            expect(received).toHaveLength(1);
            expect(received[0].path).toBe('/home');
        });

        it('Router 监听 switch 事件执行导航', () => {
            const bus = RouteEventBus.getInstance();
            const received: any[] = [];
            bus.routeOn('router', 'change', (data: any) => {
                received.push(data);
            });

            router.register({ '/home': 'HomePage' });
            router.start(true);

            bus.routeEmit(
                EventContextBuilder.create()
                    .withEvent('switch')
                    .withType('switch')
                    .withSource('router')
                    .withData({ path: '/home' })
                    .build()
            );

            expect(router.getPath()).toBe('/home');
            expect(received.length).toBeGreaterThanOrEqual(1);
        });
    });
});
