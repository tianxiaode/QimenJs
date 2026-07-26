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
import { DomainPagingAbility } from '@/entity/abilities/core/DomainPagingAbility';

function createHost(domainConfig?: any) {
    class TestHost extends ComposableBase {
        domainConfig = domainConfig;
    }
    const proto = TestHost.prototype as any;
    Object.defineProperty(proto, 'pageSize', {
        ...DomainPagingAbility.pageSize,
        configurable: true,
        enumerable: true,
    });
    Object.defineProperty(proto, 'pageSizes', {
        ...DomainPagingAbility.pageSizes,
        configurable: true,
        enumerable: true,
    });
    return new TestHost() as any;
}

describe('DomainPagingAbility', () => {
    describe('pageSize', () => {
        it('无 domainConfig 时默认 20', () => {
            const host = createHost();
            expect(host.pageSize).toBe(20);
        });

        it('从 domainConfig 读取', () => {
            const host = createHost({ pageSize: 50 });
            expect(host.pageSize).toBe(50);
        });

        it('setter 覆盖值', () => {
            const host = createHost();
            host.pageSize = 100;
            expect(host.pageSize).toBe(100);
        });

        it('setter 后 getter 返回设置值', () => {
            const host = createHost({ pageSize: 50 });
            expect(host.pageSize).toBe(50);
            host.pageSize = 30;
            expect(host.pageSize).toBe(30);
        });
    });

    describe('pageSizes', () => {
        it('无 domainConfig 时默认 [10,20,50]', () => {
            const host = createHost();
            expect(host.pageSizes).toEqual([10, 20, 50]);
        });

        it('从 domainConfig 读取', () => {
            const host = createHost({ pagesizes: [20, 40, 80] });
            expect(host.pageSizes).toEqual([20, 40, 80]);
        });

        it('setter 覆盖值', () => {
            const host = createHost();
            host.pageSizes = [25, 50];
            expect(host.pageSizes).toEqual([25, 50]);
        });
    });
});
