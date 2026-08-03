import type { InitContext } from '../../types/init-context';
import { SystemEventBus, SYSTEM_EVENTS } from '@/events';
import { PermissionRegistrar } from '@/permission/PermissionRegistrar';

const PERMISSION_SEPARATOR = ':';

export function bindPermission(ctx: InitContext): void {
    const { instance, nodeMapMgr } = ctx;
    if (!nodeMapMgr) return;

    const permissionNodes = nodeMapMgr.permissionNodes;
    if (!permissionNodes || permissionNodes.length === 0) return;

    const entityKey = (instance as any).entityKey as string | undefined;
    const domain = (instance as any).domain as string | undefined;

    const off = SystemEventBus.getInstance().on(SYSTEM_EVENTS.PERMISSION_CHANGE, (data: any) => {
        applyPermission(instance, permissionNodes, entityKey, domain);
        if (typeof (instance as any).onPermissionChange === 'function') {
            (instance as any).onPermissionChange(data);
        }
    });

    if (!(instance as any)._permissionOffs) {
        (instance as any)._permissionOffs = [];
    }
    (instance as any)._permissionOffs.push(off);

    applyPermission(instance, permissionNodes, entityKey, domain);
}

function applyPermission(
    instance: any,
    permissionNodes: Array<{ name: string; permission: string }>,
    entityKey?: string,
    domain?: string
): void {
    const registrar = PermissionRegistrar.getInstance();

    for (const { name, permission } of permissionNodes) {
        const granted = resolvePermission(registrar, permission, entityKey, domain);
        const node = instance.nodeMap?.[name];
        if (!node?.el) continue;

        if (granted) {
            node.el.removeAttribute('disabled');
            node.el.removeAttribute('hidden');
            node.el.classList.remove('q-permission-denied');
        } else {
            node.el.setAttribute('disabled', '');
            node.el.classList.add('q-permission-denied');
        }
    }
}

function resolvePermission(
    registrar: PermissionRegistrar,
    permission: string,
    entityKey?: string,
    domain?: string
): boolean {
    if (registrar.has(permission)) return true;

    const colonCount = permission.split(PERMISSION_SEPARATOR).length - 1;

    if (colonCount === 0 && entityKey) {
        const merged = `${entityKey}${PERMISSION_SEPARATOR}${permission}`;
        if (registrar.has(merged)) return true;
    }

    if (colonCount === 1 && domain) {
        const merged = `${domain}${PERMISSION_SEPARATOR}${permission}`;
        if (registrar.has(merged)) return true;
    }

    return false;
}
