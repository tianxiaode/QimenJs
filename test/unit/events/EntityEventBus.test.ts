/**
 * EntityEventBus 单元测试
 *
 * 覆盖：getInstance、getScopeId、entityEmit、entityOn、entityOnce、dispose
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

import { EntityEventBus } from '@/events/EntityEventBus';
import { EventContextBuilder } from '@/context';

describe('EntityEventBus', () => {
    beforeEach(() => {
        (EntityEventBus as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('返回单例', () => {
            const a = EntityEventBus.getInstance();
            const b = EntityEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('getScopeId', () => {
        it('返回 scopeId 字符串', () => {
            const bus = EntityEventBus.getInstance();
            expect(typeof bus.getScopeId()).toBe('string');
        });
    });

    describe('entityEmit / entityOn', () => {
        it('发送和接收实体事件', () => {
            const bus = EntityEventBus.getInstance();
            const handler = jest.fn();
            bus.entityOn('users', 'listed', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('entity:users:listed')
                .withType('listed')
                .withSource('users')
                .withData({ items: [1, 2] })
                .build();
            bus.entityEmit(ctx);

            expect(handler).toHaveBeenCalledWith(expect.objectContaining({ items: [1, 2] }));
        });
    });

    describe('entityOnce', () => {
        it('一次性监听', () => {
            const bus = EntityEventBus.getInstance();
            const handler = jest.fn();
            bus.entityOnce('orders', 'created', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('entity:orders:created')
                .withType('created')
                .withSource('orders')
                .withData({ id: 1 })
                .build();
            bus.entityEmit(ctx);
            bus.entityEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('dispose 后不再接收事件', () => {
            const bus = EntityEventBus.getInstance();
            const handler = jest.fn();
            bus.entityOn('users', 'listed', handler);
            bus.dispose();

            (EntityEventBus as any).instance = undefined;
            const bus2 = EntityEventBus.getInstance();
            const ctx = EventContextBuilder.create()
                .withEvent('entity:users:listed')
                .withType('listed')
                .withSource('users')
                .withData({})
                .build();
            bus2.entityEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });
    });
});
