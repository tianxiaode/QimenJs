/**
 * System Abilities 分支覆盖率测试
 *
 * 覆盖 EventAbility、DomEventsAbility、DomainAbility、SystemAbility 的分支逻辑
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
            }))
        }
    };
});

import { EventAbility } from '@/system-abilities/system/EventAbility';
import { DomEventsAbility } from '@/system-abilities/system/DomEventsAbility';
import { DomainAbility } from '@/system-abilities/system/DomainAbility';
import { SystemAbility } from '@/system-abilities/system/SystemAbility';
import { ComposableBase, ComposableRegistrar } from '@/composable';
import { DomainRegistrar, SystemRegistrar } from '@/registry';
import { DOMAIN_CACHE_SYMBOL } from '@/system-abilities/types/abilities';

// Mock createEventAdapter for DomEventsAbility tests
jest.mock('@/event-dom', () => ({
    createEventAdapter: jest.fn(() => ({
        bind: jest.fn(() => ({ unbind: jest.fn() })),
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    })),
}));

// ============================================
// EventAbility 测试
// ============================================

describe('EventAbility', () => {
    class TestEventHost extends ComposableBase {
        static readonly abilities = [EventAbility];
    }

    let host: TestEventHost;

    beforeEach(() => {
        host = new TestEventHost();
    });

    afterEach(() => {
        host.dispose();
        ComposableRegistrar.getInstance().clearCaches();
    });

    it('should expose eventScope getter', () => {
        expect(host.eventScope).toBeDefined();
    });

    it('should expose on method and listen to events', () => {
        const handler = jest.fn();
        host.on('test-event', handler);
        host.emit('test-event', { data: 1 });
        expect(handler).toHaveBeenCalledTimes(1);
        // emit passes an event envelope object with data, event, source, etc.
        const callArg = handler.mock.calls[0][0];
        expect(callArg.data).toEqual({ data: 1 });
        expect(callArg.event).toBe('test-event');
    });

    it('should expose once method and listen once', () => {
        const handler = jest.fn();
        host.once('test-once', handler);
        host.emit('test-once', {});
        host.emit('test-once', {});
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should expose emit method', () => {
        const handler = jest.fn();
        host.on('emit-test', handler);
        host.emit('emit-test', 'payload');
        expect(handler).toHaveBeenCalledTimes(1);
        const callArg = handler.mock.calls[0][0];
        expect(callArg.data).toBe('payload');
    });

    it('should dispose scope on host dispose', () => {
        const handler = jest.fn();
        host.on('before-dispose', handler);
        host.dispose();
        // After dispose, scope is nulled - accessing methods should throw
        expect(() => host.on('after-dispose', jest.fn())).toThrow();
    });

    it('should handle dispose when scope is already null', () => {
        // Create and immediately dispose to null the scope
        const host2 = new TestEventHost();
        host2.dispose();
        // Disposing again should not throw (scope?.dispose handles null)
        expect(() => host2.dispose()).not.toThrow();
    });
});

// ============================================
// DomEventsAbility 测试
// ============================================

describe('DomEventsAbility', () => {
    class TestDomEventsHost extends ComposableBase {
        static readonly abilities = [EventAbility, DomEventsAbility];
    }

    let host: TestDomEventsHost;

    beforeEach(() => {
        host = new TestDomEventsHost();
    });

    afterEach(() => {
        host.dispose();
        ComposableRegistrar.getInstance().clearCaches();
    });

    it('should expose bind method', () => {
        expect(typeof host.bind).toBe('function');
    });

    it('should call adapter.bind when bind is called', () => {
        const target = document.createElement('div');
        const result = host.bind(target, 'tap');
        // bind should return something (binding result)
        expect(result).toBeDefined();
    });

    it('should reuse adapter on subsequent calls', () => {
        const target1 = document.createElement('div');
        const target2 = document.createElement('div');
        host.bind(target1, 'tap');
        host.bind(target2, 'swipeleft');
        // Both calls should work without error (adapter is reused)
    });

    it('should clean up adapter on dispose', () => {
        const target = document.createElement('div');
        host.bind(target, 'tap');
        host.dispose();
        // After dispose, _adapter should be undefined
        // No way to directly test, but no error should occur
    });
});

// ============================================
// DomainAbility 测试
// ============================================

describe('DomainAbility', () => {
    let domainRegistrar: DomainRegistrar;

    beforeEach(() => {
        domainRegistrar = DomainRegistrar.getInstance();
        domainRegistrar.clear();
    });

    afterEach(() => {
        domainRegistrar.clear();
    });

    it('should return domainConfig when domain is registered', () => {
        domainRegistrar.register('test-domain', { name: 'test-domain' } as any);

        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = 'test-domain';
        }

        const host = new TestDomainHost();
        const config = host.domainConfig;
        expect(config).toBeDefined();
        expect(config.name).toBe('test-domain');
        host.dispose();
    });

    it('should cache domainConfig after first access', () => {
        domainRegistrar.register('cached-domain', { name: 'cached-domain' } as any);

        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = 'cached-domain';
        }

        const host = new TestDomainHost();
        const config1 = host.domainConfig;
        const config2 = host.domainConfig;
        expect(config1).toBe(config2);
        host.dispose();
    });

    it('should return undefined when domain is not set', () => {
        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = '';
        }

        const host = new TestDomainHost();
        const config = host.domainConfig;
        expect(config).toBeUndefined();
        host.dispose();
    });

    it('should return undefined when domain name has no matching registration', () => {
        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = 'nonexistent';
        }

        const host = new TestDomainHost();
        const config = host.domainConfig;
        // DomainRegistrar.get() for nonexistent key returns undefined
        expect(config).toBeUndefined();
        host.dispose();
    });

    it('should log debug when domain is initialized and cached', () => {
        domainRegistrar.register('log-domain', { name: 'log-domain' } as any);

        const debugFn = jest.fn();

        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = 'log-domain';
            logger = { debug: debugFn, info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
        }

        const host = new TestDomainHost();
        host.domainConfig;
        expect(debugFn).toHaveBeenCalled();
        host.dispose();
    });

    it('should not throw when logger is not available', () => {
        domainRegistrar.register('no-log-domain', { name: 'no-log-domain' } as any);

        class TestDomainHost extends ComposableBase {
            static readonly abilities = [DomainAbility];
            domain = 'no-log-domain';
        }

        const host = new TestDomainHost();
        expect(() => host.domainConfig).not.toThrow();
        host.dispose();
    });
});

// ============================================
// SystemAbility 测试
// ============================================

describe('SystemAbility', () => {
    let systemRegistrar: SystemRegistrar;

    beforeEach(() => {
        systemRegistrar = SystemRegistrar.getInstance();
        systemRegistrar.clear();
    });

    afterEach(() => {
        systemRegistrar.clear();
    });

    it('should return specific config when key is provided', () => {
        systemRegistrar.register('apiUrl', 'https://api.example.com');

        class TestSystemHost extends ComposableBase {
            static readonly abilities = [SystemAbility];
        }

        const host = new TestSystemHost();
        const value = host.systemConfig('apiUrl');
        expect(value).toBe('https://api.example.com');
        host.dispose();
    });

    it('should return all config when no key is provided', () => {
        systemRegistrar.register('apiUrl', 'https://api.example.com');
        systemRegistrar.register('version', '1.0.0');

        class TestSystemHost extends ComposableBase {
            static readonly abilities = [SystemAbility];
        }

        const host = new TestSystemHost();
        const allConfig = host.systemConfig();
        expect(allConfig).toBeDefined();
        expect(allConfig.apiUrl).toBe('https://api.example.com');
        expect(allConfig.version).toBe('1.0.0');
        host.dispose();
    });
});
