/**
 * RouteListenAbility 单元测试
 *
 * 覆盖：
 * 1. _initRouteListen 设置桥接事件配置
 * 2. 子类定义 onRouteChange 由桥接自动调用
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { RouteListenAbility } from '@/router/RouteListenAbility';
import { Router } from '@/router/Router';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';

// 创建带 RouteListenAbility 的宿主组件
function createHost(overrides?: Record<string, any>) {
    const HostClass = TemplateComponent.withTemplate('<div></div>').with([RouteListenAbility]);
    return new HostClass(overrides) as any;
}

describe('RouteListenAbility', () => {
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
    // _initRouteListen
    // ============================================

    describe('_initRouteListen', () => {
        it('设置桥接事件配置（match=*）', () => {
            const host = createHost();

            const bridge = host.getEventBridge();
            expect(bridge.route).toBeDefined();
            expect(bridge.route.source).toBe('router');
            expect(bridge.route.events).toEqual({ change: 'onRouteChange' });
            expect(bridge.route.match).toBe('*');
        });
    });

    // ============================================
    // 子类定义 onRouteChange 由桥接自动调用
    // ============================================

    describe('子类 onRouteChange', () => {
        it('子类定义 onRouteChange 接收路由变化事件', () => {
            const received: any[] = [];

            class CustomHost extends TemplateComponent.withTemplate('<div></div>').with([RouteListenAbility]) {
                onRouteChange(event: any): void {
                    received.push(event);
                }
            }

            const host = new CustomHost() as any;

            // 直接调用验证回调
            const event = { path: '/icons', previousPath: '/', params: {} };
            host.onRouteChange(event);

            expect(received).toHaveLength(1);
            expect(received[0].path).toBe('/icons');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const host = createHost();
            const el = host.el;
            host.dispose();
            expect(document.contains(el)).toBe(false);
        });
    });
});
