import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IBaseEntityState } from '@/entity/types';

export class StateSchemaAbility extends AbilityBase {
    private getSchema(proxy: AbilityProxy) {
        return (proxy.host as IBaseEntityState).schema;
    }

    protected expose(proxy: AbilityProxy): IExposeResult {
        const schema = () => this.getSchema(proxy);

        return {
            idField: { get: () => schema().idField || 'id' },
            idType: { get: () => schema().idType || 'number' },
            nameField: { get: () => schema().nameField || 'name' },
            defaultSort: { get: () => schema().defaultSort || '' },
            defaultOrder: { get: () => schema().defaultOrder || 'asc' },
            searchFields: { get: () => schema().searchFields || [] },
            isTree: { get: () => !!schema().isTree },
            isLazy: { get: () => schema().isTree ? !!(schema() as any).isLazy : false },
            root: { get: () => schema().isTree ? (schema() as any).root : '' },
            parentIdField: { get: () => schema().isTree ? (schema() as any).parentIdField : '' },
            childrenField: { get: () => schema().isTree ? (schema() as any).childrenField : '' },
            pathField: { get: () => schema().isTree ? (schema() as any).pathField : '' },
            leafField: { get: () => schema().isTree ? (schema() as any).leafField : '' },
            expandedField: { get: () => schema().isTree ? (schema() as any).expandedField : '' },
            useFlat: { get: () => schema().isTree ? !!(schema() as any).useFlat : false },
        };
    }
}
