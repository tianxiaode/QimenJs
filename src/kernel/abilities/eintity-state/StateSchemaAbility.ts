import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';

export class StateSchemaAbility<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends IBaseEntityState<T, TSearch>,
> extends AbilityBase<TState> {
    protected expose(): IExposeResult {
        const { schema } = this.host;

        return {
            // 使用 Getter 描述符
            idField: { get: () => schema.idField || 'id' },
            idType: { get: () => schema.idType || 'number' },
            nameField: { get: () => schema.nameField || 'name' },
            defaultSort: { get: () => schema.defaultSort || '' },
            defaultOrder: { get: () => schema.defaultOrder || 'asc' },
            searchFields: { get: () => schema.searchFields || [] },

            isTree: { get: () => !!schema.isTree },
            isLazy: { get: () => (schema.isTree ? !!schema.isLazy : false) },
            root: { get: () => (schema.isTree ? schema.root : '') },
            parentIdField: { get: () => (schema.isTree ? schema.parentIdField : '') },
            childrenField: { get: () => (schema.isTree ? schema.childrenField : '') },
            pathField: { get: () => (schema.isTree ? schema.pathField : '') },
            leafField: { get: () => (schema.isTree ? schema.leafField : '') },
            expandedField: { get: () => (schema.isTree ? schema.expandedField : '') },
            useFlat: { get: () => (schema.isTree ? !!schema.useFlat : false) },
        };
    }
}
