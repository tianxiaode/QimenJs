// ══════════════════════════════════════════════════════════════
// 节点元数据 — 唯一运行时数据载体
// ══════════════════════════════════════════════════════════════

import { AttrDeclMap, I18nDeclMap, PermissionDeclMap } from './declarations';
import { DecomposeResultMap } from './decompose';

// ══════════════════════════════════════════════════════════════
// 编译产物
// ══════════════════════════════════════════════════════════════

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
export type NodeIndexPath = Record<string, number[]>;
/**
 * 编译产物 — compileTemplate() 的返回值
 *
 * nodeMetas 替代了原 contentInfos + domEventBindings + componentMap，
 * 所有节点级数据统一收归到 nodeMetas 中。
 *
 * @example
 * ```ts
 * const result: CompiledTemplateResult = compileTemplate(BUTTON_TEMPLATE);
 *
 * // 访问编译产物
 * console.log(result.html);              // "<div class='q-button'>...</div>"
 * console.log(result.indexPath);         // { root: [], icon: [0], text: [1] }
 * console.log(result.nodeMetas.root);    // { name: 'root', tag: 'div', ... }
 * console.log(result.exposeNames);       // ['title', 'disabled', 'onClick']
 * console.log(result.i18nNodes);         // [{ name: 'text', i18nKey: 'button.submit' }]
 * ```
 *
 * @see compileTemplate - 编译函数
 * @see CompiledTemplateCache - 可共享的缓存部分
 */
export interface CompiledResult {
    /** 生成的 HTML 字符串 */
    html: string;

    /** 命名节点的 DOM 位置索引 */
    indexPath: NodeIndexPath;

    /** 节点元数据（编译时产出，运行时附加 el/component） */
    decomposeResultMap: DecomposeResultMap;

    /** 暴露的属性名列表（用于生成 getter/setter） */
    exposeNames: string[];

    /** i18n 节点列表（含字段名，用于 locale change 时精确刷新） */
    i18nDeclMap: I18nDeclMap;
    /** 模板缓存 */
    templateCache: HTMLTemplateElement;
    /** 权限节点列表 */
    permissionDeclMap: PermissionDeclMap;
    /** 属性声明列表 */
    attrDeclMap: AttrDeclMap;
}
