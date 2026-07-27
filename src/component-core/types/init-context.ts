/**
 * init-context.ts — 初始化管线上下文
 *
 * 管线中所有 step 函数共享的上下文对象。
 * nodeMapMgr 由 ensureNodeMap 步骤直接从 TemplateRegistrar 获取并绑定。
 */

import type { INodeMapManager } from './node-map-manager-types';

/**
 * ComponentProps — 组件运行时传入参数
 *
 * id 和 localData 有明确语义，其余为节点内容/自定义属性。
 */
export interface ComponentProps {
    id?: string;
    localData?: Record<string, any[]>;
    localDataKey?: string;
    [key: string]: any;
}

/**
 * InitContext — 管线上下文
 *
 * step 函数通过此对象访问实例、nodeMapMgr、props 等。
 * nodeMapMgr 由 ensureNodeMap 步骤填充。
 */
export interface InitContext {
    instance: any;
    props: ComponentProps;
    ctor: any;
    nodeMapMgr: INodeMapManager | null;
    debug: boolean;
    steps: string[];
}

/**
 * 创建初始上下文 — nodeMapMgr 待管线填充
 */
export function createInitContext(instance: any, props: ComponentProps): InitContext {
    const ctor = instance.constructor as any;
    return {
        instance,
        props,
        ctor,
        nodeMapMgr: null,
        debug: ctor.__runtimeDebug === true,
        steps: [],
    };
}
