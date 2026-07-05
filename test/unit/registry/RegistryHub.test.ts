import { RegistryHub, RegistryHubLockedError, RegistryHubConflictError } from '@/registry';
import { DomainRegistrar } from '@/registry/registrars';

describe('RegistryHub', () => {
    beforeEach(() => {
        // 清理注册中心，确保测试独立性
        (RegistryHub as any).registars.clear();
        (RegistryHub as any).isLocked = false;
    });

    describe('use', () => {
        it('应该能够注册一个新的注册器', () => {
            const registrar = DomainRegistrar.getInstance();

            expect(() => {
                RegistryHub.use(registrar);
            }).not.toThrow();

            expect(RegistryHub.get<DomainRegistrar>('domain')).toBe(registrar);
        });

        it('不应该允许重复注册相同的注册器', () => {
            const registrar1 = DomainRegistrar.getInstance();
            const registrar2 = DomainRegistrar.getInstance();

            RegistryHub.use(registrar1);

            expect(() => {
                RegistryHub.use(registrar2);
            }).toThrow(RegistryHubConflictError);
        });

        it('应该允许使用force参数覆盖已注册的注册器', () => {
            const registrar1 = DomainRegistrar.getInstance();
            const registrar2 = DomainRegistrar.getInstance();

            RegistryHub.use(registrar1);
            RegistryHub.use(registrar2, true);

            expect(RegistryHub.get<DomainRegistrar>('domain')).toBe(registrar2);
        });

        it('不应该允许在锁定状态下注册新注册器', () => {
            RegistryHub.lock();

            const registrar = DomainRegistrar.getInstance();

            expect(() => {
                RegistryHub.use(registrar);
            }).toThrow(RegistryHubLockedError);
        });
    });

    describe('lock', () => {
        it('应该锁定注册中心', () => {
            RegistryHub.lock();

            expect((RegistryHub as any).isLocked).toBe(true);
        });

        it('锁定后不应允许注册新注册器', () => {
            RegistryHub.lock();

            const registrar = DomainRegistrar.getInstance();

            expect(() => {
                RegistryHub.use(registrar);
            }).toThrow(RegistryHubLockedError);
        });

        it('应该调用所有已注册注册器的lock方法', () => {
            const registrar1 = DomainRegistrar.getInstance();
            const registrar2 = {
                name: 'test-registrar',
                lock: jest.fn(),
                register: jest.fn(),
                unregister: jest.fn(),
                get: jest.fn(),
                clear: jest.fn(),
                inspect: jest.fn(),
                doInspect: jest.fn(),
                checkLock: jest.fn(),
            };

            RegistryHub.use(registrar1);
            (RegistryHub as any).registars.set('test-registrar', registrar2);

            RegistryHub.lock();

            // 验证DomainRegistrar的lock方法被调用
            expect((registrar1 as any).isLocked).toBe(true);
            // 验证模拟注册器的lock方法被调用
            expect(registrar2.lock).toHaveBeenCalledTimes(1);
        });
    });

    describe('get', () => {
        it('应该能够获取已注册的注册器', () => {
            const registrar = DomainRegistrar.getInstance();
            RegistryHub.use(registrar);

            const retrieved = RegistryHub.get<DomainRegistrar>('domain');
            expect(retrieved).toBe(registrar);
        });

        it('对于未注册的名称应该返回undefined', () => {
            const retrieved = RegistryHub.get('nonexistent');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('debug', () => {
        it('应该能够输出所有注册器的信息', () => {
            const registrar = DomainRegistrar.getInstance();
            RegistryHub.use(registrar);

            // Mock console.group 和 console.groupEnd
            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            RegistryHub.debug();

            expect(consoleSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });

        it('应该能够输出指定注册器的信息', () => {
            const registrar = DomainRegistrar.getInstance();
            RegistryHub.use(registrar);

            const inspectSpy = jest.spyOn(registrar, 'inspect').mockImplementation(() => {});

            RegistryHub.debug('domain');

            expect(inspectSpy).toHaveBeenCalled();

            inspectSpy.mockRestore();
        });
    });

    describe('root proxy', () => {
        it('应该能够通过代理访问注册器', () => {
            const registrar = DomainRegistrar.getInstance();
            RegistryHub.use(registrar);

            const proxyResult = (RegistryHub.root as any).domain;
            expect(proxyResult).toBe(registrar);
        });
    });
});
