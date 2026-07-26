import { EventContextBuilder } from '@/context';
import type { EventContext, EventChainLink } from '@/context';

describe('EventContextBuilder', () => {
    describe('create', () => {
        it('should create new builder instance', () => {
            const builder = EventContextBuilder.create();
            expect(builder).toBeInstanceOf(EventContextBuilder);
        });

        it('should create independent instances', () => {
            const b1 = EventContextBuilder.create();
            const b2 = EventContextBuilder.create();
            expect(b1).not.toBe(b2);
        });
    });

    describe('build', () => {
        it('should throw error without event name', () => {
            expect(() => {
                EventContextBuilder.create().build();
            }).toThrow('EventContext is missing event name');
        });

        it('should build with minimal event name', () => {
            const ctx = EventContextBuilder.create().withEvent('user:login').build();

            expect(ctx.event).toBe('user:login');
        });

        it('should set default timestamp', () => {
            const before = Date.now();
            const ctx = EventContextBuilder.create().withEvent('test').build();
            const after = Date.now();

            expect(ctx.timestamp).toBeGreaterThanOrEqual(before);
            expect(ctx.timestamp).toBeLessThanOrEqual(after);
        });

        it('should set default busId to empty string', () => {
            const ctx = EventContextBuilder.create().withEvent('test').build();

            expect(ctx.busId).toBe('');
        });

        it('should set default scopeId to NO_SCOPE', () => {
            const ctx = EventContextBuilder.create().withEvent('test').build();

            expect(ctx.scopeId).toBe('NO_SCOPE');
        });

        it('should set default source to UNKNOWN', () => {
            const ctx = EventContextBuilder.create().withEvent('test').build();

            expect(ctx.source).toBe('UNKNOWN');
        });

        it('should initialize steps and metadata', () => {
            const ctx = EventContextBuilder.create().withEvent('test').build();

            expect(ctx.steps).toEqual([]);
            expect(ctx.metadata).toEqual({});
        });
    });

    describe('withEvent', () => {
        it('should set event name', () => {
            const ctx = EventContextBuilder.create().withEvent('userTable:selectionChange').build();

            expect(ctx.event).toBe('userTable:selectionChange');
        });
    });

    describe('withType', () => {
        it('should set event type', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withType('selectionChange')
                .build();

            expect(ctx.type).toBe('selectionChange');
        });
    });

    describe('withSource', () => {
        it('should set source', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withSource('userTable')
                .build();

            expect(ctx.source).toBe('userTable');
        });

        it('should accept object source', () => {
            const source = { id: 'comp-1', type: 'Table' };
            const ctx = EventContextBuilder.create().withEvent('test').withSource(source).build();

            expect(ctx.source).toEqual(source);
        });
    });

    describe('withSourceType', () => {
        it('should set source type', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withSourceType('UserTable')
                .build();

            expect(ctx.sourceType).toBe('UserTable');
        });
    });

    describe('withData', () => {
        it('should set event data', () => {
            const data = { rows: [], selectedCount: 0 };
            const ctx = EventContextBuilder.create().withEvent('test').withData(data).build();

            expect(ctx.data).toEqual(data);
        });
    });

    describe('withTimestamp', () => {
        it('should set custom timestamp', () => {
            const ts = 1234567890;
            const ctx = EventContextBuilder.create().withEvent('test').withTimestamp(ts).build();

            expect(ctx.timestamp).toBe(ts);
        });
    });

    describe('withBusId', () => {
        it('should set bus ID', () => {
            const ctx = EventContextBuilder.create().withEvent('test').withBusId('bus-001').build();

            expect(ctx.busId).toBe('bus-001');
        });
    });

    describe('withScopeId', () => {
        it('should set scope ID', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withScopeId('scope-user')
                .build();

            expect(ctx.scopeId).toBe('scope-user');
        });
    });

    describe('withDomEvent', () => {
        it('should set DOM event', () => {
            const domEvent = new Event('click');
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withDomEvent(domEvent)
                .build();

            expect(ctx.domEvent).toBe(domEvent);
        });
    });

    describe('withChain', () => {
        it('should set event chain', () => {
            const chain: EventChainLink[] = [
                { event: 'parent:change', type: 'change', source: 'parent', sourceType: 'Parent' },
            ];
            const ctx = EventContextBuilder.create().withEvent('test').withChain(chain).build();

            expect(ctx.chain).toEqual(chain);
        });

        it('should accept undefined chain', () => {
            const ctx = EventContextBuilder.create().withEvent('test').withChain(undefined).build();

            expect(ctx.chain).toBeUndefined();
        });
    });

    describe('withRefCount', () => {
        it('should set reference count', () => {
            const ctx = EventContextBuilder.create().withEvent('test').withRefCount(3).build();

            expect(ctx._refCount).toBe(3);
        });
    });

    describe('withMetadata', () => {
        it('should set metadata key-value', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withMetadata('custom', 'value')
                .build();

            expect(ctx.metadata!.custom).toBe('value');
        });

        it('should support multiple metadata entries', () => {
            const ctx = EventContextBuilder.create()
                .withEvent('test')
                .withMetadata('key1', 'val1')
                .withMetadata('key2', 'val2')
                .build();

            expect(ctx.metadata!.key1).toBe('val1');
            expect(ctx.metadata!.key2).toBe('val2');
        });

        it('should initialize metadata if not set', () => {
            const builder = EventContextBuilder.create();
            (builder as any).context = { event: 'test' };
            const ctx = builder.withMetadata('k', 'v').build();

            expect(ctx.metadata!.k).toBe('v');
        });
    });

    describe('chaining', () => {
        it('should support full fluent workflow', () => {
            const chain: EventChainLink[] = [
                { event: 'parent:change', type: 'change', source: 'parent', sourceType: 'Parent' },
            ];
            const domEvent = new Event('click');

            const ctx = EventContextBuilder.create()
                .withEvent('userTable:selectionChange')
                .withType('selectionChange')
                .withSource('userTable')
                .withSourceType('UserTable')
                .withData({ rows: [], selectedCount: 0 })
                .withTimestamp(1000)
                .withBusId('bus-001')
                .withScopeId('scope-main')
                .withDomEvent(domEvent)
                .withChain(chain)
                .withRefCount(2)
                .withMetadata('custom', 'value')
                .build();

            expect(ctx.event).toBe('userTable:selectionChange');
            expect(ctx.type).toBe('selectionChange');
            expect(ctx.source).toBe('userTable');
            expect(ctx.sourceType).toBe('UserTable');
            expect(ctx.data).toEqual({ rows: [], selectedCount: 0 });
            expect(ctx.timestamp).toBe(1000);
            expect(ctx.busId).toBe('bus-001');
            expect(ctx.scopeId).toBe('scope-main');
            expect(ctx.domEvent).toBe(domEvent);
            expect(ctx.chain).toEqual(chain);
            expect(ctx._refCount).toBe(2);
            expect(ctx.metadata!.custom).toBe('value');
        });
    });
});
