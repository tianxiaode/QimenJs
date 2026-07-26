jest.mock('@qimenjs/logger', () => {
    const actualLogger = jest.requireActual('@qimenjs/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                child: jest.fn().mockReturnValue({
                    debug: jest.fn(),
                    info: jest.fn(),
                    warn: jest.fn(),
                    error: jest.fn(),
                    child: jest.fn(),
                }),
            })),
        },
    };
});

import { DragEventBus } from '@/events/DragEventBus';

describe('DragEventBus', () => {
    beforeEach(() => {
        (DragEventBus as any).instance = undefined;
    });

    afterEach(() => {
        const inst = (DragEventBus as any).instance;
        if (inst) inst.dispose();
        (DragEventBus as any).instance = undefined;
    });

    describe('单例模式', () => {
        it('getInstance 返回同一实例', () => {
            const a = DragEventBus.getInstance();
            const b = DragEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('拖拽生命周期', () => {
        it('dragStart → dragEnd 完整流程', () => {
            const bus = DragEventBus.getInstance();
            const startHandler = jest.fn();
            const endHandler = jest.fn();

            bus.dragOn('card', 'start', startHandler);
            bus.dragOn('card', 'end', endHandler);

            bus.dragStart('card', {
                dragType: 'task',
                dragData: { id: 1 },
                dragEl: null,
                dragSource: null,
            });
            expect(startHandler).toHaveBeenCalledTimes(1);
            expect(bus.isDragging()).toBe(true);

            bus.dragEnd('card');
            expect(endHandler).toHaveBeenCalledTimes(1);
            expect(bus.isDragging()).toBe(false);
        });

        it('dragStart → dragCancel', () => {
            const bus = DragEventBus.getInstance();
            const cancelHandler = jest.fn();

            bus.dragOn('card', 'cancel', cancelHandler);
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            bus.dragCancel('card');

            expect(cancelHandler).toHaveBeenCalledTimes(1);
            expect(bus.isDragging()).toBe(false);
        });

        it('dragStart → dragEnter → dragLeave → dragDrop', () => {
            const bus = DragEventBus.getInstance();
            const enterHandler = jest.fn();
            const leaveHandler = jest.fn();
            const dropHandler = jest.fn();

            bus.dragOn('card', 'enter', enterHandler);
            bus.dragOn('card', 'leave', leaveHandler);
            bus.dragOn('card', 'drop', dropHandler);

            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });

            const target = {};
            const el = document.createElement('div');
            bus.dragEnter('card', target, el);
            expect(enterHandler).toHaveBeenCalledTimes(1);

            bus.dragLeave('card', target, el);
            expect(leaveHandler).toHaveBeenCalledTimes(1);

            bus.dragDrop('card', target, el);
            expect(dropHandler).toHaveBeenCalledTimes(1);
            expect(bus.isDragging()).toBe(false);
        });
    });

    describe('状态守卫', () => {
        it('未 dragStart 时 dragEnd 被忽略', () => {
            const bus = DragEventBus.getInstance();
            bus.dragEnd('card');
            expect(bus.isDragging()).toBe(false);
        });

        it('重复 dragStart 被忽略', () => {
            const bus = DragEventBus.getInstance();
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            expect(bus.isDragging()).toBe(true);

            bus.dragStart('other', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            expect(bus.getActiveDrag()!.dragKey).toBe('card');
        });

        it('dragKey 不匹配时操作被忽略', () => {
            const bus = DragEventBus.getInstance();
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            bus.dragEnd('other');
            expect(bus.isDragging()).toBe(true);
        });
    });

    describe('getActiveDrag / isDragging', () => {
        it('无拖拽时返回 null', () => {
            const bus = DragEventBus.getInstance();
            expect(bus.getActiveDrag()).toBeNull();
            expect(bus.isDragging()).toBe(false);
        });

        it('拖拽中返回正确状态', () => {
            const bus = DragEventBus.getInstance();
            bus.dragStart('card', {
                dragType: 'task',
                dragData: { id: 1 },
                dragEl: null,
                dragSource: null,
            });
            expect(bus.getActiveDrag()).toEqual({
                dragKey: 'card',
                dragType: 'task',
                dragData: { id: 1 },
                dragEl: null,
                dragSource: null,
            });
            expect(bus.isDragging()).toBe(true);
        });
    });

    describe('dragOnce', () => {
        it('一次性监听，触发后自动移除', () => {
            const bus = DragEventBus.getInstance();
            const handler = jest.fn();

            bus.dragOnce('card', 'start', handler);
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            expect(handler).toHaveBeenCalledTimes(1);

            bus.dragEnd('card');
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('dispose 后清除拖拽状态', () => {
            const bus = DragEventBus.getInstance();
            bus.dragStart('card', {
                dragType: 'task',
                dragData: {},
                dragEl: null,
                dragSource: null,
            });
            bus.dispose();
            expect(bus.isDragging()).toBe(false);
        });
    });
});
