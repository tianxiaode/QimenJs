/**
 * dom-path.ts — DOM 路径查找工具
 *
 * 根据 indexPath（编译产物）在运行时 DOM 树中定位节点。
 * 编译时由 CompileEngine 产出 indexPath，运行时由此函数定位实际 DOM 元素。
 */

/**
 * 按子节点索引路径定位 DOM 元素
 *
 * @param root - 搜索起点元素
 * @param path - 子节点索引路径（由编译时 indexPath 产出）
 * @returns 定位到的 HTMLElement，路径不存在时返回 null
 *
 * @example
 * ```ts
 * // 编译时产出: indexPath['text'] = [0, 1]
 * // 运行时定位: const el = findByPath(rootEl, [0, 1])
 * ```
 */
export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}
