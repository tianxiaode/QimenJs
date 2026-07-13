/**
 * RouteEmitAbility 单元测试
 *
 * 覆盖：
 * 1. navigate 调用 Router.navigate 切换路由
 * 2. navigate 传递 replace 参数
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { RouteEmitAbility } from '@/router/RouteEmitAbility';
import { Router } from '@/router/Router';
import { EventSourceRegistrar } from '@/events/EventSourceRegistrar';

// 创建带 RouteEmitAbility 的宿主组件
function createHost(overrides?: Record<string, any>) {
    const HostClass = TemplateComponent.withTemplate('<div></div>').with([RouteEmitAbility]);
    return new HostClass(overrides) as any;
}

describe('RouteEmitAbility', () => {
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
    // navigate
    // ============================================

    describe('navigate', () => {
        it('调用 Router.navigate 切换路由', () => {
            const host = createHost();
            const navigateSpy = jest.spyOn(router, 'navigate');

            host.navigate('/home');

            expect(navigateSpy).toHaveBeenCalledWith('/home', undefined);
        });

        it('传递 replace 参数', () => {
            const host = createHost();
            const navigateSpy = jest.spyOn(router, 'navigate');

            host.navigate('/home', true);

            expect(navigateSpy).toHaveBeenCalledWith('/home', true);
        });
    });
});
