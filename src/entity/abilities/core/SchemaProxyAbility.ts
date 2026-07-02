import type { AbilityDefinition } from '@/composable';

/**
 * SchemaProxyAbility - Schema 属性代理能力
 * 
 * 为宿主提供 schema 相关属性的便捷访问。
 * this 指向宿主（Manager），this.schema 可直接访问。
 */
export const SchemaProxyAbility: AbilityDefinition = {
    idField: { get() { return this.schema?.idField || 'id'; } },
    idType: { get() { return this.schema?.idType || 'number'; } },
    nameField: { get() { return this.schema?.nameField || 'name'; } },
    defaultSort: { get() { return this.schema?.defaultSort || ''; } },
    defaultOrder: { get() { return this.schema?.defaultOrder || 'asc'; } },
    searchFields: { get() { return this.schema?.searchFields || []; } },
    isTree: { get() { return !!this.schema?.isTree; } },
    isLazy: { get() { return this.schema?.isTree ? !!(this.schema as any).isLazy : false; } },
    root: { get() { return this.schema?.isTree ? (this.schema as any).root : ''; } },
    parentIdField: { get() { return this.schema?.isTree ? (this.schema as any).parentIdField : ''; } },
    childrenField: { get() { return this.schema?.isTree ? (this.schema as any).childrenField : ''; } },
    pathField: { get() { return this.schema?.isTree ? (this.schema as any).pathField : ''; } },
    leafField: { get() { return this.schema?.isTree ? (this.schema as any).leafField : ''; } },
    expandedField: { get() { return this.schema?.isTree ? (this.schema as any).expandedField : ''; } },
    useFlat: { get() { return this.schema?.isTree ? !!(this.schema as any).useFlat : false; } },
};
