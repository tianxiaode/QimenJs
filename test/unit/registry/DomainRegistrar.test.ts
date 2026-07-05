import { DomainRegistrar } from '@/registry/registrars';
import { DomainConfig } from '@/registry/types';

describe('DomainRegistrar', () => {
    let domainRegistrar: DomainRegistrar;

    beforeEach(() => {
        domainRegistrar = new DomainRegistrar();
    });

    describe('register', () => {
        it('应该能够注册域配置', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);

            const result = domainRegistrar.get('example');
            expect(result).toBe(config);
        });

        it('应该能够通过force参数覆盖已存在的配置', () => {
            const config1: DomainConfig = {
                baseUrl: 'https://api1.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            const config2: DomainConfig = {
                baseUrl: 'https://api2.example.com',
                preset: 'spring',
                pageSize: 20,
                pagesizes: [10, 20, 50, 100],
            };

            domainRegistrar.register('example', config1);
            domainRegistrar.register('example', config2, true); // 强制覆盖

            const result = domainRegistrar.get('example');
            expect(result).toBe(config2);
        });

        it('不应该允许重复注册相同的域名称', () => {
            const config1: DomainConfig = {
                baseUrl: 'https://api1.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            const config2: DomainConfig = {
                baseUrl: 'https://api2.example.com',
                preset: 'spring',
                pageSize: 20,
                pagesizes: [10, 20, 50, 100],
            };

            domainRegistrar.register('example', config1);

            expect(() => {
                domainRegistrar.register('example', config2);
            }).toThrow();
        });

        it('在锁定状态下应该抛出错误', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.lock();

            expect(() => {
                domainRegistrar.register('example', config);
            }).toThrow('[Registrar: domain] modification denied: Locked.');
        });
    });

    describe('unregister', () => {
        it('应该能够注销域配置', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);
            expect(domainRegistrar.get('example')).toBe(config);

            domainRegistrar.unregister('example');
            expect(domainRegistrar.get('example')).toBeUndefined();
        });

        it('在锁定状态下应该抛出错误', () => {
            domainRegistrar.lock();

            expect(() => {
                domainRegistrar.unregister('example');
            }).toThrow('[Registrar: domain] modification denied: Locked.');
        });
    });

    describe('get', () => {
        it('应该能够获取已注册的域配置', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);

            const result = domainRegistrar.get('example');
            expect(result).toBe(config);
        });

        it('对于未注册的域应该返回undefined', () => {
            const result = domainRegistrar.get('nonexistent');
            expect(result).toBeUndefined();
        });
    });

    describe('getBaseUrl', () => {
        it('应该能够获取域的基地址', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);

            const baseUrl = domainRegistrar.getBaseUrl('example');
            expect(baseUrl).toBe('https://api.example.com');
        });
    });

    describe('clear', () => {
        it('应该清空所有注册的域配置', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);
            expect(domainRegistrar.get('example')).toBe(config);

            domainRegistrar.clear();
            expect(domainRegistrar.get('example')).toBeUndefined();
        });

        it('在锁定状态下应该抛出错误', () => {
            domainRegistrar.lock();

            expect(() => {
                domainRegistrar.clear();
            }).toThrow('[Registrar: domain] modification denied: Locked.');
        });
    });

    describe('lock', () => {
        it('应该锁定注册器', () => {
            domainRegistrar.lock();
            expect((domainRegistrar as any).isLocked).toBe(true);
        });
    });

    describe('inspect', () => {
        it('应该输出注册器状态', () => {
            const config: DomainConfig = {
                baseUrl: 'https://api.example.com',
                preset: 'abp',
                pageSize: 10,
                pagesizes: [10, 20, 50],
            };

            domainRegistrar.register('example', config);

            const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            domainRegistrar.inspect();

            expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: domain [🔓]');
            expect(consoleTableSpy).toHaveBeenCalled();
            expect(consoleGroupEndSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
            consoleTableSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });
    });
});
