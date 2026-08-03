jest.mock('@/events', () => ({
    COMPONENT_LIFECYCLE_EVENTS: {
        INIT: 'init',
        MOUNTED: 'mounted',
        BEFORE_UNMOUNT: 'beforeunmount',
        DISPOSE: 'dispose',
        UPDATED: 'updated',
        RESIZE: 'resize',
        HIDDEN_CHANGE: 'hiddenchange',
    },
    globalEventBus: {
        getBusId: jest.fn(() => 'test-bus-id'),
    },
}));

import { LifecycleAbility } from '@/component-core/abilities/LifecycleAbility';

describe('LifecycleAbility', () => {
    const makeInstance = (overrides: Record<string, any> = {}) => ({
        _emitLifecycleEvent: LifecycleAbility._emitLifecycleEvent,
        ...overrides,
    });

    it('提供 _emitMounted 方法', () => {
        expect(typeof LifecycleAbility._emitMounted).toBe('function');
    });

    it('提供 _emitUpdated 方法', () => {
        expect(typeof LifecycleAbility._emitUpdated).toBe('function');
    });

    it('提供 _emitResize 方法', () => {
        expect(typeof LifecycleAbility._emitResize).toBe('function');
    });

    it('提供 _emitLifecycleEvent 方法', () => {
        expect(typeof LifecycleAbility._emitLifecycleEvent).toBe('function');
    });

    it('_emitMounted 调用 onMounted 钩子并发送 mounted 事件', () => {
        const onMountedSpy = jest.fn();
        const emitSpy = jest.fn();
        const instance = makeInstance({ onMounted: onMountedSpy, emit: emitSpy });
        LifecycleAbility._emitMounted.call(instance);
        expect(onMountedSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(
            'mounted',
            expect.objectContaining({ data: undefined })
        );
    });

    it('_emitUpdated 调用 onUpdated 钩子并发送 updated 事件', () => {
        const onUpdatedSpy = jest.fn();
        const emitSpy = jest.fn();
        const instance = makeInstance({ onUpdated: onUpdatedSpy, emit: emitSpy });
        LifecycleAbility._emitUpdated.call(instance, { prop: 'cls' });
        expect(onUpdatedSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(
            'updated',
            expect.objectContaining({ data: { prop: 'cls' } })
        );
    });

    it('_emitResize 调用 onResize 钩子并发送 resize 事件', () => {
        const onResizeSpy = jest.fn();
        const emitSpy = jest.fn();
        const entry = { contentRect: { width: 100, height: 200 } } as any;
        const instance = makeInstance({ onResize: onResizeSpy, emit: emitSpy });
        LifecycleAbility._emitResize.call(instance, entry);
        expect(onResizeSpy).toHaveBeenCalledWith(entry);
        expect(emitSpy).toHaveBeenCalledWith(
            'resize',
            expect.objectContaining({ data: { width: 100, height: 200 } })
        );
    });

    it('_emitLifecycleEvent 有 eventKey 时发送组件事件', () => {
        const emitSpy = jest.fn();
        const componentEmitSpy = jest.fn();
        const instance = makeInstance({
            emit: emitSpy,
            componentEmit: componentEmitSpy,
            eventKey: 'formKey',
        });
        LifecycleAbility._emitLifecycleEvent.call(instance, 'mounted');
        expect(emitSpy).toHaveBeenCalledWith(
            'mounted',
            expect.objectContaining({ data: undefined })
        );
        expect(componentEmitSpy).toHaveBeenCalledWith(
            expect.objectContaining({ event: 'mounted', source: 'formKey' })
        );
    });

    it('_emitLifecycleEvent 无 eventKey 时不发送组件事件', () => {
        const emitSpy = jest.fn();
        const componentEmitSpy = jest.fn();
        const instance = makeInstance({ emit: emitSpy, componentEmit: componentEmitSpy });
        LifecycleAbility._emitLifecycleEvent.call(instance, 'mounted');
        expect(emitSpy).toHaveBeenCalledWith(
            'mounted',
            expect.objectContaining({ data: undefined })
        );
        expect(componentEmitSpy).not.toHaveBeenCalled();
    });

    it('_emitLifecycleEvent 从 constructor.eventKey 读取', () => {
        const emitSpy = jest.fn();
        const componentEmitSpy = jest.fn();
        const instance = makeInstance({
            emit: emitSpy,
            componentEmit: componentEmitSpy,
            constructor: { eventKey: 'tableKey', name: 'TestComp' },
        });
        LifecycleAbility._emitLifecycleEvent.call(instance, 'updated');
        expect(componentEmitSpy).toHaveBeenCalledWith(
            expect.objectContaining({ event: 'updated', source: 'tableKey' })
        );
    });
});
