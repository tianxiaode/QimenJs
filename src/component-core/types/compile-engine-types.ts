/**
 * compile-engine-types.ts — 编译引擎类型
 *
 * 定义模板编译引擎的输入输出类型。
 * 编译引擎负责将 TplNode 模板转换为可复用的编译产物。
 */

import type { NodeMetadata, CompiledTemplateCache } from './compiled-types';

/**
 * 编译结果 — compileTemplate() 的返回值
 *
 * 包含编译产物的可共享缓存部分和运行时需要修改的节点元数据。
 *
 * @example
 * ```ts
 * import { compileTemplate } from './compile-engine';
 * import { BUTTON_TEMPLATE } from './button-tpl';
 *
 * // 编译模板
 * const result: CompileResult = compileTemplate(BUTTON_TEMPLATE);
 *
 * // 访问编译产物
 * console.log(result.cache.html);          // HTML 字符串
 * console.log(result.cache.exposeNames);    // 暴露的属性名
 * console.log(result.nodeMetas.root);       // 根节点元数据
 *
 * // 运行时修改 nodeMetas（不会影响 cache）
 * result.nodeMetas.icon.el = document.querySelector('.icon');
 * result.nodeMetas.icon.component = iconComponent;
 * ```
 *
 * @see CompiledTemplateCache - 可共享的缓存部分
 * @see NodeMetadata - 节点元数据定义
 * @see compileTemplate - 编译函数
 */
export interface CompileResult {
    /**
     * 编译缓存（只读可共享部分）
     *
     * 包含 HTML、indexPath、exposeNames、i18nNodes、templateCache。
     * 这些数据在多个组件实例间共享，不会被修改。
     */
    cache: CompiledTemplateCache;

    /**
     * 节点元数据（运行时可修改部分）
     *
     * key 为节点 name，value 为 NodeMetadata。
     * 编译时初始化，运行时附加 el/component 等实例数据。
     */
    nodeMetas: Record<string, NodeMetadata>;
}
