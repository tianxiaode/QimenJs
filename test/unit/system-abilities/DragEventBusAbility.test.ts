/**
 * DragEventBusAbility 单元测试
 *
 * 覆盖：dragStart、dragEnd、dragCancel、dragEnter、dragLeave、dragDrop、
 *       dragOn、dragOnce、getActiveDrag、isDragging
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { DragEventBusAbility } from '@/system-abilities/system/DragEventBusAbility';
import { DragEventBus } from '@/events/DragEventBus';

function createHost() {
    class TestHost extends ComposableBase {}
    withAbilities(TestHost, [DragEventBusAbility]);
    return new TestHost() as any;
}

describe('DragEventBusAbility', () => {
    beforeEach(() => {
        (DragEventBus as any).instance = undefined;
    });

    describe('dragStart / dragEnd / dragCancel', () => {
        it('dragStart 不报错', () => {
            const host = createHost();
            expect(() =>
                host.dragStart('test', {
                    dragType: 'item',
                    dragData: {},
                    dragEl: document.createElement('div'),
                    dragSource: null,
                })
            ).not.toThrow();
        });

        it('dragEnd 不报错', () => {
            const host = createHost();
            host.dragStart('test', {
                dragType: 'item',
                dragData: {},
                dragEl: document.createElement('div'),
                dragSource: null,
            });
            expect(() => host.dragEnd('test')).not.toThrow();
        });

        it('dragCancel 不报错', () => {
            const host = createHost();
            host.dragStart('test', {
                dragType: 'item',
                dragData: {},
                dragEl: document.createElement('div'),
                dragSource: null,
            });
            expect(() => host.dragCancel('test')).not.toThrow();
        });
    });

    describe('dragEnter / dragLeave / dragDrop', () => {
        it('dragEnter 不报错', () => {
            const host = createHost();
            expect(() => host.dragEnter('test', null, document.createElement('div'))).not.toThrow();
        });

        it('dragLeave 不报错', () => {
            const host = createHost();
            expect(() => host.dragLeave('test', null, document.createElement('div'))).not.toThrow();
        });

        it('dragDrop 不报错', () => {
            const host = createHost();
            expect(() => host.dragDrop('test', null, document.createElement('div'))).not.toThrow();
        });
    });

    describe('dragOn', () => {
        it('注册监听并返回 off 函数', () => {
            const host = createHost();
            const handler = jest.fn();
            const off = host.dragOn('test', 'start', handler);
            expect(typeof off).toBe('function');
        });
    });

    describe('dragOnce', () => {
        it('一次性监听不报错', () => {
            const host = createHost();
            const handler = jest.fn();
            expect(() => host.dragOnce('test', 'start', handler)).not.toThrow();
        });
    });

    describe('getActiveDrag / isDragging', () => {
        it('无活动拖拽时 getActiveDrag 返回 null', () => {
            const host = createHost();
            expect(host.getActiveDrag()).toBeNull();
        });

        it('无活动拖拽时 isDragging 返回 false', () => {
            const host = createHost();
            expect(host.isDragging()).toBe(false);
        });
    });
});
