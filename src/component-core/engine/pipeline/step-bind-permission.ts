import type { InitContext } from '../../types/init-context';
import { SystemEventBus, SYSTEM_EVENTS } from '@/events';
import { PermissionRegistrar } from '@/permission';
import type { PermissionQuery } from '@/permission';

const PERMISSION_SEPARATOR = ':';
const BTN_SUFFIXES = /Btn|Button|Action$/;

/** 管线步骤：绑定权限控制，根据权限状态禁用/隐藏节点 */
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
    permissionNodes: Array<{ name: string; permission: boolean | string }>,
    entityKey?: string,
    domain?: string
): void {
    const registrar = PermissionRegistrar.getInstance();

    for (const { name, permission } of permissionNodes) {
        const query = resolveQuery(permission, name, instance, entityKey, domain);
        const granted = registrar.hasPermission(query);
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

function resolveQuery(
    permission: boolean | string,
    name: string,
    instance: any,
    entityKey?: string,
    domain?: string
): PermissionQuery {
    if (permission === true) {
        const action =
            (instance as any).nodeMap?.[name]?.action ??
            name.replace(BTN_SUFFIXES, '').toLowerCase();
        return { action, entityKey, domain };
    }

    const parts = (permission as string).split(PERMISSION_SEPARATOR);

    switch (parts.length) {
        case 1:
            return { action: parts[0], entityKey, domain };
        case 2:
            return { action: parts[1], entityKey: parts[0], domain };
        case 3:
            return { action: parts[2], entityKey: parts[1], domain: parts[0] };
        default:
            return { action: permission as string, entityKey, domain };
    }
}
