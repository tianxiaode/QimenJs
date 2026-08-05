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

import { FileEventBus } from '@/events/FileEventBus';
import { EventContextBuilder } from '@/context';

describe('FileEventBus', () => {
    let bus: FileEventBus;

    beforeEach(() => {
        (FileEventBus as any).instance = undefined;
        bus = FileEventBus.getInstance();
    });

    afterEach(() => {
        bus.dispose();
        (FileEventBus as any).instance = undefined;
    });

    describe('getInstance', () => {
        it('returns singleton', () => {
            const a = FileEventBus.getInstance();
            const b = FileEventBus.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('getScopeId', () => {
        it('returns a string scopeId', () => {
            expect(typeof bus.getScopeId()).toBe('string');
        });
    });

    describe('fileEmit / fileOn', () => {
        it('handler receives data from EventContext', () => {
            const handler = jest.fn();
            bus.fileOn('avatars', 'uploaded', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('file:avatars:uploaded')
                .withType('uploaded')
                .withSource('avatars')
                .withData({ item: 'file1', result: 'ok' })
                .build();

            bus.fileEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({ item: 'file1', result: 'ok' });
        });

        it('unsubscribe stops receiving events', () => {
            const handler = jest.fn();
            const off = bus.fileOn('docs', 'downloaded', handler);

            off();

            const ctx = EventContextBuilder.create()
                .withEvent('file:docs:downloaded')
                .withType('downloaded')
                .withSource('docs')
                .withData({})
                .build();

            bus.fileEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });

        it('different fileKeys are isolated', () => {
            const handlerA = jest.fn();
            const handlerB = jest.fn();
            bus.fileOn('channelA', 'uploaded', handlerA);
            bus.fileOn('channelB', 'uploaded', handlerB);

            const ctx = EventContextBuilder.create()
                .withEvent('file:channelA:uploaded')
                .withType('uploaded')
                .withSource('channelA')
                .withData({ x: 1 })
                .build();

            bus.fileEmit(ctx);

            expect(handlerA).toHaveBeenCalledTimes(1);
            expect(handlerB).not.toHaveBeenCalled();
        });
    });

    describe('fileOnce', () => {
        it('handler fires only once', () => {
            const handler = jest.fn();
            bus.fileOnce('avatars', 'uploaded', handler);

            const ctx = EventContextBuilder.create()
                .withEvent('file:avatars:uploaded')
                .withType('uploaded')
                .withSource('avatars')
                .withData({})
                .build();

            bus.fileEmit(ctx);
            bus.fileEmit(ctx);

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispose', () => {
        it('clears all listeners', () => {
            const handler = jest.fn();
            bus.fileOn('avatars', 'uploaded', handler);

            bus.dispose();

            const ctx = EventContextBuilder.create()
                .withEvent('file:avatars:uploaded')
                .withType('uploaded')
                .withSource('avatars')
                .withData({})
                .build();

            bus.fileEmit(ctx);
            expect(handler).not.toHaveBeenCalled();
        });
    });
});
