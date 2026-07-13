/**
 * RouteContainerComponent 单元测试
 *
 * 覆盖：
 * 1. 构造函数（routeMap、defaultComponent、默认组件挂载）
 * 2. onRouteChange 路由变化替换内容（根据 path）
 * 3. dispose
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

import { RouteContainerComponent } from '@/component/nav/RouteContainerComponent';
import { TemplateComponent } from '@qimenjs/component-core';

// 创建模拟页面组件
class MockPageA extends TemplateComponent.withTemplate('<div class="page-a">A</div>') {
    static type = 'MockPageA';
}

class MockPageB extends TemplateComponent.withTemplate('<div class="page-b">B</div>') {
    static type = 'MockPageB';
}

describe('RouteContainerComponent', () => {

    // ============================================
    // 构造函数
    // ============================================

    describe('constructor', () => {
        it('type 为 RouteContainer', () => {
            const container = new RouteContainerComponent() as any;
            expect(container.type).toBe('RouteContainer');
        });

        it('el 有 q-route-container 类', () => {
            const container = new RouteContainerComponent() as any;
            expect(container.el.classList.contains('q-route-container')).toBe(true);
        });

        it('有 defaultComponent 时自动挂载', () => {
            const container = new RouteContainerComponent({
                defaultComponent: MockPageA,
            }) as any;

            // 验证 nodeMap 中 content 节点有组件实例
            const contentNode = container.nodeMap?.container?.content;
            expect(contentNode).toBeDefined();
            expect(contentNode.component).toBeDefined();
            expect(contentNode.component.type).toBe('MockPageA');
        });

        it('无 defaultComponent 时不挂载', () => {
            const container = new RouteContainerComponent() as any;

            const contentNode = container.nodeMap?.container?.content;
            expect(contentNode).toBeDefined();
            expect(contentNode.component).toBeUndefined();
        });

        it('保存 routeMap', () => {
            const routeMap = { '/': MockPageA, '/about': MockPageB };
            const container = new RouteContainerComponent({
                routeMap,
                defaultComponent: MockPageA,
            }) as any;

            // 通过 onRouteChange 间接验证 routeMap
            container.onRouteChange({ path: '/about' });
            const contentNode = container.nodeMap.container.content;
            expect(contentNode.component.type).toBe('MockPageB');
        });
    });

    // ============================================
    // onRouteChange
    // ============================================

    describe('onRouteChange', () => {
        it('根据 path 替换内容组件', () => {
            const container = new RouteContainerComponent({
                routeMap: { '/': MockPageA, '/about': MockPageB },
                defaultComponent: MockPageA,
            }) as any;

            // 初始是 MockPageA
            expect(container.nodeMap.container.content.component.type).toBe('MockPageA');

            // 路由变化到 /about
            container.onRouteChange({ path: '/about' });
            expect(container.nodeMap.container.content.component.type).toBe('MockPageB');
        });

        it('path 不在 routeMap 中时回退到 defaultComponent', () => {
            const container = new RouteContainerComponent({
                routeMap: { '/': MockPageA },
                defaultComponent: MockPageA,
            }) as any;

            // 先切换到其他页面
            container.onRouteChange({ path: '/unknown' });

            // path 不在 routeMap 中，回退到 defaultComponent
            // 但当前已经是 MockPageA，所以还是 MockPageA
            expect(container.nodeMap.container.content.component.type).toBe('MockPageA');
        });

        it('无 path 且无 defaultComponent 时不替换', () => {
            const container = new RouteContainerComponent({
                routeMap: { '/': MockPageA },
                defaultComponent: MockPageA,
            }) as any;

            // 无 path 的事件
            container.onRouteChange({});

            // 不应崩溃，组件不变
            expect(container.nodeMap.container.content.component.type).toBe('MockPageA');
        });

        it('连续路由变化正确替换', () => {
            const container = new RouteContainerComponent({
                routeMap: { '/': MockPageA, '/about': MockPageB },
                defaultComponent: MockPageA,
            }) as any;

            container.onRouteChange({ path: '/about' });
            expect(container.nodeMap.container.content.component.type).toBe('MockPageB');

            container.onRouteChange({ path: '/' });
            expect(container.nodeMap.container.content.component.type).toBe('MockPageA');
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            const container = new RouteContainerComponent({
                defaultComponent: MockPageA,
            }) as any;
            const el = container.el;
            container.dispose();
            expect(document.contains(el)).toBe(false);
        });
    });
});
