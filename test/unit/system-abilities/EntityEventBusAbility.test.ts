/**
 * EntityEventBusAbility 单元测试
 *
 * 覆盖：entityEmit、entityOn、entityOnce
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
import { EntityEventBusAbility } from '@/system-abilities/system/EntityEventBusAbility';
import { EntityEventBus } from '@/events/EntityEventBus';
import { EventContextBuilder } from '@/context';

function createHost() {
    class TestHost extends ComposableBase {}
    withAbilities(TestHost, [EntityEventBusAbility]);
    return new TestHost() as any;
}

describe('EntityEventBusAbility', () => {
    beforeEach(() => {
        (EntityEventBus as any).instance = undefined;
    });

    describe('entityEmit', () => {
        it('发送实体事件', () => {
            const host = createHost();
            const ctx = EventContextBuilder.create()
                .withEvent('entity:users:listed')
                .withType('listed')
                .withSource('users')
                .withData({ items: [] })
                .build();
            expect(() => host.entityEmit(ctx)).not.toThrow();
        });
    });

    describe('entityOn', () => {
        it('监听实体事件返回 off 函数', () => {
            const host = createHost();
            const handler = jest.fn();
            const off = host.entityOn('users', 'listed', handler);
            expect(typeof off).toBe('function');
        });

        it('监听后接收事件', () => {
            const host = createHost();
            const handler = jest.fn();
            host.entityOn('users', 'listed', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('entity:users:listed')
                .withType('listed')
                .withSource('users')
                .withData({ items: [1] })
                .build();
            host.entityEmit(ctx);
            expect(handler).toHaveBeenCalled();
        });
    });

    describe('entityOnce', () => {
        it('一次性监听', () => {
            const host = createHost();
            const handler = jest.fn();
            host.entityOnce('orders', 'created', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('entity:orders:created')
                .withType('created')
                .withSource('orders')
                .withData({})
                .build();
            host.entityEmit(ctx);
            host.entityEmit(ctx);
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });
});
