import { PermissionRegistrar } from '@/permission/PermissionRegistrar';
import { PERMISSION_CHANGE_EVENT } from '@/permission/types';
import { SystemEventBus } from '@/events';

describe('PermissionRegistrar', () => {
    let registrar: PermissionRegistrar;

    beforeEach(() => {
        (PermissionRegistrar as any).instances = new Map();
        registrar = new PermissionRegistrar();
    });

    describe('registerDomain & hasPermission', () => {
        it('默认域：action 匹配', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });
            expect(registrar.hasPermission({ action: 'create', entityKey: 'users' })).toBe(true);
        });

        it('默认域：全局 action 匹配', () => {
            registrar.registerDomain('default', { permissions: ['admin'] });
            expect(registrar.hasPermission({ action: 'admin' })).toBe(true);
        });

        it('未注册权限应返回 false', () => {
            expect(registrar.hasPermission({ action: 'create', entityKey: 'users' })).toBe(false);
        });

        it('指定 domain 查询', () => {
            registrar.registerDomain('abp', { permissions: ['Users.Create'] });
            expect(registrar.hasPermission({ action: 'create', domain: 'abp' })).toBe(false);
        });

        it('自定义验证函数', () => {
            registrar.registerDomain('abp', {
                permissions: ['Users.Create', 'ADMIN'],
                validate: (query, granted) => {
                    if (granted.has('ADMIN')) return true;
                    const key = capitalize(query.entityKey) + '.' + capitalize(query.action);
                    return granted.has(key);
                },
            });

            expect(
                registrar.hasPermission({ action: 'create', entityKey: 'users', domain: 'abp' })
            ).toBe(true);
            expect(
                registrar.hasPermission({ action: 'delete', entityKey: 'users', domain: 'abp' })
            ).toBe(true);
        });

        it('未指定 domain 时遍历所有域', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });
            registrar.registerDomain('abp', { permissions: ['ADMIN'] });
            expect(registrar.hasPermission({ action: 'create', entityKey: 'users' })).toBe(true);
        });

        it('向已有域追加权限', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });
            registrar.registerDomain('default', { permissions: ['users:delete'] });
            expect(registrar.getByDomain('default')).toEqual(
                expect.arrayContaining(['users:create', 'users:delete'])
            );
        });
    });

    describe('unregister', () => {
        it('注销指定权限码', () => {
            registrar.registerDomain('default', { permissions: ['users:create', 'users:delete'] });
            registrar.unregister('default', 'users:create');
            expect(registrar.hasPermission({ action: 'create', entityKey: 'users' })).toBe(false);
            expect(registrar.hasPermission({ action: 'delete', entityKey: 'users' })).toBe(true);
        });

        it('域下无权限时移除整个域', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });
            registrar.unregister('default', 'users:create');
            expect(registrar.getDomains()).not.toContain('default');
        });
    });

    describe('clearDomain', () => {
        it('存在的域应被清除并触发事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');
            registrar.registerDomain('default', { permissions: ['users:create'] });
            bridgeEmitSpy.mockClear();

            registrar.clearDomain('default');

            expect(registrar.getDomains()).not.toContain('default');
            expect(bridgeEmitSpy).toHaveBeenCalledWith(
                PERMISSION_CHANGE_EVENT,
                expect.objectContaining({
                    data: { domains: ['default'], type: 'clear' },
                    source: 'permission',
                })
            );
        });

        it('不存在的域不应触发事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');
            registrar.clearDomain('nonexistent');
            expect(bridgeEmitSpy).not.toHaveBeenCalled();
        });
    });

    describe('getByDomain', () => {
        it('存在的域应返回权限码数组', () => {
            registrar.registerDomain('default', { permissions: ['users:create', 'users:delete'] });
            expect(registrar.getByDomain('default')).toEqual(['users:create', 'users:delete']);
        });

        it('不存在的域应返回空数组', () => {
            expect(registrar.getByDomain('nonexistent')).toEqual([]);
        });
    });

    describe('getDomainSize', () => {
        it('存在的域应返回权限数量', () => {
            registrar.registerDomain('default', { permissions: ['users:create', 'users:delete'] });
            expect(registrar.getDomainSize('default')).toBe(2);
        });

        it('不存在的域应返回 0', () => {
            expect(registrar.getDomainSize('nonexistent')).toBe(0);
        });
    });

    describe('getDomains', () => {
        it('应返回所有已注册的域名称', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });
            registrar.registerDomain('abp', { permissions: ['Users.Create'] });
            expect(registrar.getDomains()).toEqual(expect.arrayContaining(['default', 'abp']));
        });
    });

    describe('emitChange', () => {
        it('通过 SystemEventBus 触发事件不应报错', () => {
            expect(() => {
                registrar.registerDomain('default', { permissions: ['users:create'] });
            }).not.toThrow();
        });
    });

    describe('doInspect', () => {
        it('空存储时应输出 (empty)', () => {
            const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            registrar.inspect();

            expect(groupSpy).toHaveBeenCalledWith('🔐 Permission Registry Status');
            expect(logSpy).toHaveBeenCalledWith('(empty)');
            groupSpy.mockRestore();
            logSpy.mockRestore();
            groupEndSpy.mockRestore();
        });

        it('非空存储时应输出域信息', () => {
            registrar.registerDomain('default', { permissions: ['users:create'] });

            const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const tableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            registrar.inspect();

            expect(groupSpy).toHaveBeenCalledWith('🔐 Permission Registry Status');
            expect(groupSpy).toHaveBeenCalledWith('Domain: default (1)');
            expect(tableSpy).toHaveBeenCalled();
            groupSpy.mockRestore();
            tableSpy.mockRestore();
            groupEndSpy.mockRestore();
        });
    });
});

function capitalize(s?: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}
