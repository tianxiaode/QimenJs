/**
 * DragDispatchCenter 单元测试
 *
 * 覆盖：register、unregister、get、handleInit、disposeByComponent、dispose
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

import { DragDispatchCenter } from '@/drag/DragDispatchCenter';

describe('DragDispatchCenter', () => {
    let center: DragDispatchCenter;

    beforeEach(() => {
        center = new DragDispatchCenter();
    });

    describe('register / get', () => {
        it('注册和获取拖拽定义', () => {
            const def = { axis: 'x' as const };
            center.register('comp1:body', def);
            expect(center.get('comp1:body')).toBe(def);
        });

        it('获取未注册的 key 返回 undefined', () => {
            expect(center.get('nonexist')).toBeUndefined();
        });
    });

    describe('unregister', () => {
        it('注销拖拽定义', () => {
            center.register('comp1:body', { axis: 'x' as const });
            center.unregister('comp1:body');
            expect(center.get('comp1:body')).toBeUndefined();
        });
    });

    describe('handleInit', () => {
        it('无 component 或 drags 时不报错', () => {
            expect(() => center.handleInit('comp1', {})).not.toThrow();
            expect(() => center.handleInit('comp1', { component: null })).not.toThrow();
            expect(() => center.handleInit('comp1', { drags: null })).not.toThrow();
        });

        it('注册拖拽实例', () => {
            const el = document.createElement('div');
            const component = {
                el,
                nodeMap: { body: { el } },
                onCleanup: jest.fn(),
                bind: jest.fn(),
                on: jest.fn().mockReturnValue(jest.fn()),
            };
            center.handleInit('comp1', {
                component,
                drags: { body: { axis: 'y' } },
            });
            expect(component.bind).toHaveBeenCalledWith(el, 'drag');
            expect(component.onCleanup).toHaveBeenCalled();
        });
    });

    describe('disposeByComponent', () => {
        it('销毁指定组件的所有拖拽实例', () => {
            const el = document.createElement('div');
            const component = {
                el,
                nodeMap: { body: { el } },
                onCleanup: jest.fn(),
                bind: jest.fn(),
                on: jest.fn().mockReturnValue(jest.fn()),
            };
            center.handleInit('comp1', {
                component,
                drags: { body: {} },
            });
            center.disposeByComponent('comp1');
        });
    });

    describe('dispose', () => {
        it('销毁所有拖拽实例', () => {
            center.register('comp1:body', {});
            center.register('comp2:header', {});
            center.dispose();
        });
    });
});
