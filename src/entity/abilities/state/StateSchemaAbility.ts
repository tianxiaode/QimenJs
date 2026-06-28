import { AbilityBase, type IExposeResult } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';

export class StateSchemaAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            // 使用 Getter 描述符
            idField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.idField || 'id';
            }},
            idType: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.idType || 'number';
            }},
            nameField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.nameField || 'name';
            }},
            defaultSort: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.defaultSort || '';
            }},
            defaultOrder: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.defaultOrder || 'asc';
            }},
            searchFields: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.searchFields || [];
            }},

            isTree: { get: () => {
                const host = this.host as IBaseEntityState;
                return !!host.schema.isTree;
            }},
            isLazy: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? !!(host.schema as any).isLazy : false;
            }},
            root: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).root : '';
            }},
            parentIdField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).parentIdField : '';
            }},
            childrenField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).childrenField : '';
            }},
            pathField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).pathField : '';
            }},
            leafField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).leafField : '';
            }},
            expandedField: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? (host.schema as any).expandedField : '';
            }},
            useFlat: { get: () => {
                const host = this.host as IBaseEntityState;
                return host.schema.isTree ? !!(host.schema as any).useFlat : false;
            }},
        };
    }
}
