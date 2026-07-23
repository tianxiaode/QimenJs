import type { AbilityDefinition } from '@/composable';
import type { TreeSchema } from '@/schema';

/**
 * TreeViewAbility - 树视图能力
 *
 * 为宿主提供树形结构的视图刷新功能（flat/tree 两种格式）。
 * this 指向宿主（TreeRemoteEntityState），this.nodes/hierarchy/schema/items 可直接访问。
 */
export const TreeViewAbility= {
    refreshView() {
        const schema = this.schema as TreeSchema;

        const newItems =
            schema.useFlat !== false ? this._generateFlatItems() : this._generateTreeData();

        this.items = newItems;
    },

    _generateFlatItems(): any[] {
        const result: any[] = [];
        const schema = this.schema as TreeSchema;
        const expandedField = schema.expandedField || 'expanded';
        const idField = this.idField;

        const walk = (pid: string | number | null, depth: number) => {
            const childIds = this.hierarchy.get(pid) || [];
            const children = childIds.map((id: any) => this.nodes.get(id)!).filter(Boolean);
            const sortedChildren = this.applySort(children);

            sortedChildren.forEach((node: any) => {
                result.push({ ...node, _depth: depth });

                if ((node as any)[expandedField]) {
                    walk(node[idField], depth + 1);
                }
            });
        };

        walk(this.root || null, 0);
        return result;
    },

    _generateTreeData(): any[] {
        const schema = this.schema as TreeSchema;
        const childrenField = schema.childrenField || 'children';
        const idField = this.idField;

        const build = (pid: string | number | null): any[] => {
            const childIds = this.hierarchy.get(pid) || [];
            const children = childIds.map((id: any) => this.nodes.get(id)!).filter(Boolean);
            const sorted = this.applySort(children);

            return sorted.map((node: any) => ({
                ...node,
                [childrenField]: build(node[idField]),
            }));
        };

        return build(this.root || null);
    },
} satisfies AbilityDefinition;
