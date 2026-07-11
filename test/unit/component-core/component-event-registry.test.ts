/**
 * ComponentEventRegistry 单元测试
 */

import { ComponentEventRegistry } from '@/component-core/ComponentEventRegistry';
import { TemplateComponent } from '@/component-core';

const TPL = '<div class="box"></div>';

describe('ComponentEventRegistry', () => {
    let registry: ComponentEventRegistry;

    beforeEach(() => {
        // 每次测试获取新实例（单例，但可以清理内部状态）
        registry = ComponentEventRegistry.getInstance();
    });

    afterEach(() => {
        // 清理测试数据
        registry.unregisterByComponent('test-comp-1');
        registry.unregisterByComponent('test-comp-2');
    });

    function createMockComponent(id: string) {
        const comp = new (TemplateComponent.withTemplate(TPL).with([]))() as any;
        comp.id = id;
        return comp;
    }

    function createMockEventBus() {
        const handlers = new Map<string, Function>();
        return {
            on: jest.fn((key: string, handler: Function) => {
                handlers.set(key, handler);
                return () => handlers.delete(key);
            }),
            emit: jest.fn((key: string, ...args: any[]) => {
                const handler = handlers.get(key);
                if (handler) handler(...args);
            }),
        };
    }

    describe('register', () => {
        it('注册事件并返回清理函数', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();
            const handler = jest.fn();

            const off = registry.register(comp, 'click', handler, bus);

            expect(registry.has('test-comp-1:click')).toBe(true);
            expect(bus.on).toHaveBeenCalledWith('test-comp-1:click', handler);
            expect(typeof off).toBe('function');
        });

        it('调用清理函数后事件被注销', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();
            const handler = jest.fn();

            const off = registry.register(comp, 'click', handler, bus);
            off();

            expect(registry.has('test-comp-1:click')).toBe(false);
        });

        it('重复注册同一 eventKey → 替换旧注册', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            registry.register(comp, 'click', handler1, bus);
            registry.register(comp, 'click', handler2, bus);

            // 应该只有一条注册
            expect(registry.size).toBe(1);
        });
    });

    describe('unregisterByKey', () => {
        it('按 eventKey 取消注册', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();
            const handler = jest.fn();

            registry.register(comp, 'click', handler, bus);
            registry.unregisterByKey('test-comp-1:click');

            expect(registry.has('test-comp-1:click')).toBe(false);
        });

        it('不存在的 key → 不报错', () => {
            expect(() => registry.unregisterByKey('nonexistent:key')).not.toThrow();
        });
    });

    describe('unregisterByComponent', () => {
        it('按组件 id 取消所有注册', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();

            registry.register(comp, 'click', jest.fn(), bus);
            registry.register(comp, 'change', jest.fn(), bus);

            expect(registry.getComponentEvents('test-comp-1').length).toBe(2);

            registry.unregisterByComponent('test-comp-1');

            expect(registry.getComponentEvents('test-comp-1').length).toBe(0);
        });

        it('不存在的 componentId → 不报错', () => {
            expect(() => registry.unregisterByComponent('nonexistent')).not.toThrow();
        });
    });

    describe('getComponentEvents', () => {
        it('返回组件的所有事件', () => {
            const comp = createMockComponent('test-comp-1');
            const bus = createMockEventBus();

            registry.register(comp, 'click', jest.fn(), bus);
            registry.register(comp, 'change', jest.fn(), bus);

            const events = registry.getComponentEvents('test-comp-1');
            expect(events).toContain('test-comp-1:click');
            expect(events).toContain('test-comp-1:change');
        });

        it('无注册 → 空数组', () => {
            expect(registry.getComponentEvents('nonexistent')).toEqual([]);
        });
    });

    describe('size', () => {
        it('返回注册总数', () => {
            const comp1 = createMockComponent('test-comp-1');
            const comp2 = createMockComponent('test-comp-2');
            const bus = createMockEventBus();

            const initialSize = registry.size;
            registry.register(comp1, 'click', jest.fn(), bus);
            registry.register(comp2, 'change', jest.fn(), bus);

            expect(registry.size).toBe(initialSize + 2);
        });
    });
});
