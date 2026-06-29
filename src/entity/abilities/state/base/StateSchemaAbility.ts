import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';

export class StateSchemaAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            idField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.idField || 'id';
            }},
            idType: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.idType || 'number';
            }},
            nameField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.nameField || 'name';
            }},
            defaultSort: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.defaultSort || '';
            }},
            defaultOrder: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.defaultOrder || 'asc';
            }},
            searchFields: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.searchFields || [];
            }},

            isTree: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return !!host.schema.isTree;
            }},
            isLazy: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? !!(host.schema as any).isLazy : false;
            }},
            root: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).root : '';
            }},
            parentIdField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).parentIdField : '';
            }},
            childrenField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).childrenField : '';
            }},
            pathField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).pathField : '';
            }},
            leafField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).leafField : '';
            }},
            expandedField: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).expandedField : '';
            }},
            useFlat: { get: () => {
                const host = proxy.host as IBaseEntityState;
                return host.schema.isTree ? !!(host.schema as any).useFlat : false;
            }},
        };
    }
}
