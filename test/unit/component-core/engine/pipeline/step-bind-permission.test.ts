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

import { bindPermission } from '@/component-core/engine/pipeline/step-bind-permission';
import { SystemEventBus, SYSTEM_EVENTS } from '@/events';
import { PermissionRegistrar } from '@/permission';

describe('step-bind-permission', () => {
    let registrar: PermissionRegistrar;
    let bus: SystemEventBus;

    beforeEach(() => {
        registrar = PermissionRegistrar.getInstance();
        bus = SystemEventBus.getInstance();
        registrar.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function createInstance(
        permissionNodes: Array<{ name: string; permission: boolean | string }>,
        extras: Record<string, any> = {}
    ) {
        const nodeMap: Record<string, any> = {};
        for (const { name } of permissionNodes) {
            nodeMap[name] = {
                el: {
                    setAttribute: jest.fn(),
                    removeAttribute: jest.fn(),
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                action: extras[name]?.action,
            };
        }
        return {
            nodeMap,
            entityKey: 'users',
            domain: 'test-domain',
            _permissionOffs: [] as Array<() => void>,
            onPermissionChange: jest.fn(),
        };
    }

    describe('bindPermission', () => {
        it('no nodeMapMgr → early return', () => {
            const ctx = { instance: {}, nodeMapMgr: undefined } as any;
            expect(() => bindPermission(ctx)).not.toThrow();
        });

        it('empty permissionNodes → early return', () => {
            const ctx = { instance: {}, nodeMapMgr: { permissionNodes: [] } } as any;
            expect(() => bindPermission(ctx)).not.toThrow();
        });

        it('granted permission removes disabled/hidden', () => {
            registrar.registerDomain('test-domain', { permissions: ['users:create'] });
            const instance = createInstance([{ name: 'createBtn', permission: true }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'createBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            const el = instance.nodeMap.createBtn.el;
            expect(el.removeAttribute).toHaveBeenCalledWith('disabled');
            expect(el.removeAttribute).toHaveBeenCalledWith('hidden');
            expect(el.classList.remove).toHaveBeenCalledWith('q-permission-denied');
        });

        it('denied permission sets disabled and class', () => {
            const instance = createInstance([{ name: 'deleteBtn', permission: true }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'deleteBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            const el = instance.nodeMap.deleteBtn.el;
            expect(el.setAttribute).toHaveBeenCalledWith('disabled', '');
            expect(el.classList.add).toHaveBeenCalledWith('q-permission-denied');
        });

        it('permission=true resolves action from nodeMap action', () => {
            registrar.registerDomain('test-domain', { permissions: ['custom-action'] });
            const instance = createInstance([{ name: 'myBtn', permission: true }], {
                myBtn: { action: 'custom-action' },
            });
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'myBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.myBtn.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('permission=true resolves action from name (strip Btn/Button/Action)', () => {
            registrar.registerDomain('test-domain', { permissions: ['users:create'] });
            const instance = createInstance([{ name: 'createBtn', permission: true }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'createBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.createBtn.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('permission string with 1 part → action only', () => {
            registrar.registerDomain('test-domain', { permissions: ['edit'] });
            const instance = createInstance([{ name: 'btn1', permission: 'edit' }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'btn1', permission: 'edit' }] },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.btn1.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('permission string with 2 parts → entityKey:action', () => {
            registrar.registerDomain('test-domain', { permissions: ['orders:delete'] });
            const instance = createInstance([{ name: 'btn2', permission: 'orders:delete' }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'btn2', permission: 'orders:delete' }] },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.btn2.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('permission string with 3 parts → domain:entityKey:action', () => {
            registrar.registerDomain('admin', { permissions: ['products:read'] });
            const instance = createInstance([{ name: 'btn3', permission: 'admin:products:read' }]);
            const ctx = {
                instance,
                nodeMapMgr: {
                    permissionNodes: [{ name: 'btn3', permission: 'admin:products:read' }],
                },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.btn3.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('permission string with 4+ parts → fallback to full string as action', () => {
            registrar.registerDomain('test-domain', { permissions: ['a:b:c:d'] });
            const instance = createInstance([{ name: 'btn4', permission: 'a:b:c:d' }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'btn4', permission: 'a:b:c:d' }] },
            } as any;

            bindPermission(ctx);

            expect(instance.nodeMap.btn4.el.removeAttribute).toHaveBeenCalledWith('disabled');
        });

        it('subscribes to PERMISSION_CHANGE event', () => {
            const instance = createInstance([{ name: 'createBtn', permission: true }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'createBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            expect(instance._permissionOffs.length).toBeGreaterThan(0);
        });

        it('PERMISSION_CHANGE event triggers re-apply and onPermissionChange', () => {
            registrar.registerDomain('test-domain', { permissions: ['users:create'] });
            const instance = createInstance([{ name: 'createBtn', permission: true }]);
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'createBtn', permission: true }] },
            } as any;

            bindPermission(ctx);

            registrar.unregister('test-domain', 'users:create');
            bus.emit(SYSTEM_EVENTS.PERMISSION_CHANGE, {
                event: SYSTEM_EVENTS.PERMISSION_CHANGE,
                type: SYSTEM_EVENTS.PERMISSION_CHANGE,
                source: 'system',
                data: {},
            } as any);

            expect(instance.onPermissionChange).toHaveBeenCalled();
        });

        it('node without el is skipped', () => {
            const instance = {
                nodeMap: { orphan: { el: null } },
                entityKey: 'users',
                domain: 'test',
                _permissionOffs: [],
            };
            const ctx = {
                instance,
                nodeMapMgr: { permissionNodes: [{ name: 'orphan', permission: true }] },
            } as any;

            expect(() => bindPermission(ctx)).not.toThrow();
        });
    });
});
