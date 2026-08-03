/**
 * PermissionRegistrar 单元测试
 *
 * 覆盖所有分支：
 * - has: 无分隔符 / 有分隔符但无权限 / 有权限
 * - hasAll: 全部有 / 部分有 / 全部无
 * - hasAny: 任一有 / 任一无
 * - clearDomain: 存在的域 / 不存在的域
 * - registerBatch: 新域 / 已有域 / 空列表
 * - unregisterBatch: 域存在 / 域不存在 / 域清空后移除
 * - getByDomain: 存在 / 不存在
 * - getDomainSize: 存在 / 不存在
 * - doInspect: 空 / 非空
 * - emitChange: 有 eventBus / 无 eventBus
 */

import { PermissionRegistrar } from '@/permission/PermissionRegistrar';
import { PERMISSION_CHANGE_EVENT } from '@/permission/types';
import { SystemEventBus } from '@/events';

describe('PermissionRegistrar', () => {
    let registrar: PermissionRegistrar;

    beforeEach(() => {
        (PermissionRegistrar as any).instances = new Map();
        registrar = new PermissionRegistrar();
    });

    describe('register & has', () => {
        it('has() 对无分隔符的权限码应返回 false', () => {
            registrar.register('system', 'user:create');
            expect(registrar.has('noseparator')).toBe(false);
        });

        it('has() 对有分隔符但未注册的权限应返回 false', () => {
            expect(registrar.has('system:user:create')).toBe(false);
        });

        it('has() 对已注册的权限应返回 true', () => {
            registrar.register('system', 'user:create', 'user:delete');
            expect(registrar.has('system:user:create')).toBe(true);
            expect(registrar.has('system:user:delete')).toBe(true);
        });

        it('has() 对已注册域中不存在的权限码应返回 false', () => {
            registrar.register('system', 'user:create');
            expect(registrar.has('system:user:export')).toBe(false);
        });
    });

    describe('hasAll', () => {
        it('全部权限都有时返回 true', () => {
            registrar.register('system', 'user:create', 'user:delete');
            expect(registrar.hasAll(['system:user:create', 'system:user:delete'])).toBe(true);
        });

        it('部分权限缺失时返回 false', () => {
            registrar.register('system', 'user:create');
            expect(registrar.hasAll(['system:user:create', 'system:user:delete'])).toBe(false);
        });

        it('全部权限都缺失时返回 false', () => {
            expect(registrar.hasAll(['system:user:create', 'system:user:delete'])).toBe(false);
        });

        it('空数组应返回 true', () => {
            expect(registrar.hasAll([])).toBe(true);
        });
    });

    describe('hasAny', () => {
        it('任一权限有时返回 true', () => {
            registrar.register('system', 'user:create');
            expect(registrar.hasAny(['system:user:create', 'system:user:delete'])).toBe(true);
        });

        it('全部权限都无时返回 false', () => {
            expect(registrar.hasAny(['system:user:create', 'system:user:delete'])).toBe(false);
        });

        it('空数组应返回 false', () => {
            expect(registrar.hasAny([])).toBe(false);
        });
    });

    describe('registerBatch', () => {
        it('应该批量注册多个域的权限', () => {
            registrar.registerBatch([
                { domain: 'system', codes: ['user:create'] },
                { domain: 'business', codes: ['order:approve'] },
            ]);

            expect(registrar.has('system:user:create')).toBe(true);
            expect(registrar.has('business:order:approve')).toBe(true);
        });

        it('应该向已有域追加权限', () => {
            registrar.register('system', 'user:create');
            registrar.registerBatch([{ domain: 'system', codes: ['user:delete'] }]);

            expect(registrar.has('system:user:create')).toBe(true);
            expect(registrar.has('system:user:delete')).toBe(true);
        });

        it('空列表不应触发事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');

            registrar.registerBatch([]);

            expect(bridgeEmitSpy).not.toHaveBeenCalled();
        });

        it('有变更时应触发 permission:change 事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');

            registrar.registerBatch([{ domain: 'system', codes: ['user:create'] }]);

            expect(bridgeEmitSpy).toHaveBeenCalledWith(
                PERMISSION_CHANGE_EVENT,
                expect.objectContaining({
                    data: { domains: ['system'], type: 'register' },
                    source: 'permission',
                })
            );
        });
    });

    describe('unregisterBatch', () => {
        it('域不存在时应跳过（不报错）', () => {
            registrar.register('system', 'user:create');
            registrar.unregisterBatch([{ domain: 'nonexistent', codes: ['x'] }]);

            expect(registrar.has('system:user:create')).toBe(true);
        });

        it('应该注销指定权限码', () => {
            registrar.register('system', 'user:create', 'user:delete');
            registrar.unregisterBatch([{ domain: 'system', codes: ['user:create'] }]);

            expect(registrar.has('system:user:create')).toBe(false);
            expect(registrar.has('system:user:delete')).toBe(true);
        });

        it('域下无权限时应移除整个域', () => {
            registrar.register('system', 'user:create');
            registrar.unregisterBatch([{ domain: 'system', codes: ['user:create'] }]);

            expect(registrar.getDomains()).not.toContain('system');
        });

        it('域下仍有权限时应保留域', () => {
            registrar.register('system', 'user:create', 'user:delete');
            registrar.unregisterBatch([{ domain: 'system', codes: ['user:create'] }]);

            expect(registrar.getDomains()).toContain('system');
            expect(registrar.has('system:user:delete')).toBe(true);
        });

        it('空列表不应触发事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');

            registrar.unregisterBatch([]);

            expect(bridgeEmitSpy).not.toHaveBeenCalled();
        });

        it('有变更时应触发 permission:change 事件（type=unregister）', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');

            registrar.register('system', 'user:create');
            bridgeEmitSpy.mockClear();

            registrar.unregisterBatch([{ domain: 'system', codes: ['user:create'] }]);

            expect(bridgeEmitSpy).toHaveBeenCalledWith(
                PERMISSION_CHANGE_EVENT,
                expect.objectContaining({
                    data: { domains: ['system'], type: 'unregister' },
                    source: 'permission',
                })
            );
        });
    });

    describe('clearDomain', () => {
        it('存在的域应被清除并触发事件', () => {
            const bridgeEmitSpy = jest.spyOn(SystemEventBus.getInstance(), '_bridgeEmit');

            registrar.register('system', 'user:create');
            bridgeEmitSpy.mockClear();

            registrar.clearDomain('system');

            expect(registrar.has('system:user:create')).toBe(false);
            expect(registrar.getDomains()).not.toContain('system');
            expect(bridgeEmitSpy).toHaveBeenCalledWith(
                PERMISSION_CHANGE_EVENT,
                expect.objectContaining({
                    data: { domains: ['system'], type: 'clear' },
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
            registrar.register('system', 'user:create', 'user:delete');
            expect(registrar.getByDomain('system')).toEqual(['user:create', 'user:delete']);
        });

        it('不存在的域应返回空数组', () => {
            expect(registrar.getByDomain('nonexistent')).toEqual([]);
        });
    });

    describe('getDomainSize', () => {
        it('存在的域应返回权限数量', () => {
            registrar.register('system', 'user:create', 'user:delete');
            expect(registrar.getDomainSize('system')).toBe(2);
        });

        it('不存在的域应返回 0', () => {
            expect(registrar.getDomainSize('nonexistent')).toBe(0);
        });
    });

    describe('getDomains', () => {
        it('应返回所有已注册的域名称', () => {
            registrar.register('system', 'user:create');
            registrar.register('business', 'order:approve');
            expect(registrar.getDomains()).toEqual(expect.arrayContaining(['system', 'business']));
        });
    });

    describe('emitChange', () => {
        it('通过 SystemEventBus 触发事件不应报错', () => {
            expect(() => {
                registrar.register('system', 'user:create');
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
            registrar.register('system', 'user:create');

            const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
            const tableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
            const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

            registrar.inspect();

            expect(groupSpy).toHaveBeenCalledWith('🔐 Permission Registry Status');
            expect(groupSpy).toHaveBeenCalledWith('Domain: system (1)');
            expect(tableSpy).toHaveBeenCalled();
            groupSpy.mockRestore();
            tableSpy.mockRestore();
            groupEndSpy.mockRestore();
        });
    });
});
