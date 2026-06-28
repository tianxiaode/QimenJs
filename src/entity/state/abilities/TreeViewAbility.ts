import { AbilityBase, type IExposeResult } from '@/composable';
import type { IEntity, ITreeSearchParams, TreeSchema } from '@/schema';

export class TreeViewAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            refreshView: () => this.refreshView(),
        };
    }

    protected refreshView() {
        const host = this.host as any;
        const schema = host.schema as TreeSchema;

        // 根据配置决定生成何种格式
        const newItems =
            schema.useFlat !== false ? this.generateFlatItems() : this.generateTreeData();

        // 物理替换数组引用，Vue 会精准捕捉到这一层级的变动
        host.items = newItems;
    }

    protected generateFlatItems(): any[] {
        const host = this.host as any;
        const result: any[] = [];
        const schema = host.schema as TreeSchema;
        const expandedField = schema.expandedField || 'expanded';
        const idField = host.idField;

        /**
         * @param pid 当前处理的父 ID
         * @param depth 当前深度，用于 UI 缩进控制
         */
        const walk = (pid: string | number | null, depth: number) => {
            // 1. 从索引表中取出当前层级的所有子 ID
            const childIds = host.hierarchy.get(pid) || [];

            // 2. 获取实体并进行排序（利用你已有的 applySort）
            const children = childIds.map((id: any) => host.nodes.get(id)!).filter(Boolean);
            const sortedChildren = host.applySort(children);

            // 3. 遍历并递归
            sortedChildren.forEach((node: any) => {
                // 注入深度信息，方便组件渲染缩进
                // 💡 这里我们不需要修改原始 node，而是解构出一个新对象
                result.push({ ...node, _depth: depth });

                // 4. 只有当父节点被展开时，才继续往下走
                if ((node as any)[expandedField]) {
                    walk(node[idField], depth + 1);
                }
            });
        };

        // 从 Schema 定义的根节点开始走
        walk(host.root || null, 0);
        return result;
    }

    protected generateTreeData(): any[] {
        const host = this.host as any;
        const schema = host.schema as TreeSchema;
        const childrenField = schema.childrenField || 'children';
        const idField = host.idField;

        const build = (pid: string | number | null): any[] => {
            const childIds = host.hierarchy.get(pid) || [];
            const children = childIds.map((id: any) => host.nodes.get(id)!).filter(Boolean);
            const sorted = host.applySort(children);

            return sorted.map((node: any) => ({
                ...node,
                [childrenField]: build(node[idField]), // 递归构建嵌套结构
            }));
        };

        return build(host.root || null);
    }
}
