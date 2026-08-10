import type { TplDecl } from '../types';

/** 模板检查器，提供模板树打印、节点路径收集与检查功能 */
export class TplInspector {
    static printTree(node: TplDecl, indent: number = 0): void {
        const prefix = ' '.repeat(indent);
        const name = node.name ?? '(匿名)';
        const typeInfo = node.type
            ? typeof node.type === 'string'
                ? ` → ${node.type}`
                : ` → ${(node.type as any).name?.replace(/Component$/, '')}`
            : '';
        const hidden = node.hidden ? ' [hidden]' : '';
        console.log(`${prefix}├── ${name}${typeInfo}${hidden}`);

        if (node.children) {
            for (const child of node.children) {
                TplInspector.printTree(child, indent + 2);
            }
        }
    }

    static collectPaths(node: TplDecl, parentPath: string = '', result: string[] = []): string[] {
        const name = node.name;
        if (name) {
            const fullPath = parentPath ? `${parentPath}.${name}` : name;
            result.push(fullPath);

            if (node.type) {
                const typeName =
                    typeof node.type === 'string'
                        ? node.type
                        : ((node.type as any).name?.replace(/Component$/, '') ?? '');
                result.push(`${fullPath}.${typeName}`);
            }
        }

        if (node.children) {
            const currentPath = parentPath ? `${parentPath}.${name ?? ''}` : (name ?? '');
            for (const child of node.children) {
                TplInspector.collectPaths(child, currentPath, result);
            }
        }
        return result;
    }

    static inspect(node: TplDecl, title?: string): void {
        if (title) {
            console.log(`  📄 ${title}`);
        }
        TplInspector.printTree(node, title ? 2 : 0);

        const paths = TplInspector.collectPaths(node);
        if (paths.length) {
            console.log(`\n     可用节点路径 (用于 domEvents 第二层 key):`);
            for (const p of paths) {
                console.log(`       ${p}`);
            }
        }
    }
}
