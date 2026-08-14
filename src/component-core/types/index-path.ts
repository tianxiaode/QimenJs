// ============================================
// 基础声明（无泛型依赖）
// ============================================

/**
 * 节点位置索引 — 记录命名节点在模板 DOM 树中的位置路径
 *
 * key 为节点 name，value 为从根节点到该节点的子节点索引路径。
 * 用于运行时快速定位节点元素，避免每次查询。
 *
 * @example
 * ```ts
 * const indexPath: NodeIndexPath = {
 *     'root': [],                    // 根节点，路径为空
 *     'header': [0],                 // 第一个子节点
 *     'title': [0, 1],               // header 的第二个子节点
 *     'content': [1],                // 第二个子节点
 *     'footer': [2, 0, 1]            // footer 的第一个子节点的第二个子节点
 * };
 *
 * // 使用 indexPath 定位节点
 * function locateNode(template: HTMLTemplateElement, indexPath: number[]): HTMLElement {
 *     let current = template.content.firstChild;
 *     for (const index of indexPath) {
 *         current = current.childNodes[index];
 *     }
 *     return current as HTMLElement;
 * }
 * ```
 */
export type NodeIndexPath = number[];

export type NodeIndexPathMap = Record<string, NodeIndexPath>;
