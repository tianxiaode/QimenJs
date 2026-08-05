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

import { RouteEventBus } from '@/events/RouteEventBus';
import { EventContextBuilder } from '@/context';

describe('RouteEventBus', () => {
    let bus: RouteEventBus;

    beforeEach(() => {
        (RouteEventBus as any).instance = undefined;
        bus = RouteEventBus.getInstance();
    });

    afterEach(() => {
        bus.dispose();
        (RouteEventBus as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('returns singleton', () => {
            const a = RouteEventBus.getInstance();
            const b = RouteEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('getScopeId', () => {
        it('returns a string', () => {
            expect(typeof bus.getScopeId()).toBe('string');
        });
    });

    describe('routeEmit / routeOn', () => {
        it('handler receives data from EventContext', () => {
            const handler = jest.fn();
            bus.routeOn('router', 'change', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('route:router:change')
                .withType('change')
                .withSource('router')
                .withData({ path: '/users' })
                .build();

            bus.routeEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ path: '/users' });
        });

        it('unsubscribe stops receiving events', () => {
            const handler = jest.fn();
            const off = bus.routeOn('router', 'change', handler);

            off();

            const ctx = EventContextBuilder.create()
                .withEvent('route:router:change')
                .withType('change')
                .withSource('router')
                .withData({})
                .build();

            bus.routeEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });

        it('different routeKeys are isolated', () => {
            const handlerA = jest.fn();
            const handlerB = jest.fn();
            bus.routeOn('routerA', 'change', handlerA);
            bus.routeOn('routerB', 'change', handlerB);

            const ctx = EventContextBuilder.create()
                .withEvent('route:routerA:change')
                .withType('change')
                .withSource('routerA')
                .withData({ x: 1 })
                .build();

            bus.routeEmit(ctx);

            expect(handlerA).toHaveBeenCalledTimes(1);
            expect(handlerB).not.toHaveBeenCalled();
        });

        it('specific event name does not match generic', () => {
            const genericHandler = jest.fn();
            const specificHandler = jest.fn();
            bus.routeOn('router', 'change', genericHandler);
            bus.routeOn('router', 'change:users', specificHandler);

            const ctx = EventContextBuilder.create()
                .withEvent('route:router:change:users')
                .withType('change:users')
                .withSource('router')
                .withData({})
                .build();

            bus.routeEmit(ctx);

            expect(specificHandler).toHaveBeenCalledTimes(1);
            expect(genericHandler).not.toHaveBeenCalled();
        });
    });

    describe('routeOnce', () => {
        it('handler fires only once', () => {
            const handler = jest.fn();
            bus.routeOnce('router', 'change', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('route:router:change')
                .withType('change')
                .withSource('router')
                .withData({})
                .build();

            bus.routeEmit(ctx);
            bus.routeEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('clears all listeners', () => {
            const handler = jest.fn();
            bus.routeOn('router', 'change', handler);

            bus.dispose();

            const ctx = EventContextBuilder.create()
                .withEvent('route:router:change')
                .withType('change')
                .withSource('router')
                .withData({})
                .build();

            bus.routeEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });
    });
});
