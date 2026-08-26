/**
 * pipeline-types.ts — 管线类型定义
 *
 * Step: 纯函数，接收上下文，支持同步/异步返回。
 * Phase: 命名步骤集合，按顺序执行。
 */

/** 初始化步骤函数类型，接收上下文，支持同步/异步返回 */
export type InitStep = (ctx: any) => void | Promise<void>;

/** 管线阶段定义，包含阶段名与步骤列表 */
export interface Phase {
    name: string;
    steps: InitStep[];
}
