/**
 * node-map-manager-types.ts — NodeMapManager 接口定义
 *
 * 解耦 types 层对 NodeMapManager 类本体的依赖，避免循环引用。
 * InitContext 等类型只引用此接口，不引用类。
 */

import type { NodeMetadata, NodeIndexPath } from './compiled-types';

export interface INodeMapManager {
    readonly indexPath: NodeIndexPath;
    readonly nodeMetas: Record<string, NodeMetadata>;
    readonly i18nNodes: Array<{ name: string; i18nKey: string }>;
    readonly exposeNames: string[];
    readonly rootTag: string;
    readonly el: HTMLElement;

    get(name: string): NodeMetadata | undefined;
    getAll(): Record<string, NodeMetadata>;
    set(name: string, meta: NodeMetadata): void;
    remove(name: string): void;

    /**
     * 运行时动态替换指定节点的子组件
     *
     * 销毁旧组件 → 创建新组件实例 → DOM 原位替换 → 合并 nodeMap。
     * 与模板编译期的 Component.replace() 不同，这是运行时操作。
     */
    replace(
        name: string,
        ComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any | null;

    disposeAll(): void;
    mountChildComponent(node: NodeMetadata, child: any): void;
    buildDOM(): HTMLElement;
}
