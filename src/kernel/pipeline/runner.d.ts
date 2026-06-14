import { ActionEntry, FlowContext } from '../types';
/**
 * 执行流水线函数
 *
 * 此函数按照预设顺序执行一系列操作(action)，对传入的上下文对象进行处理
 * 操作会被排序，按类别(category)降序排列，同一类别内按偏移量(offset)升序排列
 *
 * @param context - 流程上下文，包含请求数据和状态信息
 * @param actions - 要执行的操作列表
 * @returns Promise<FlowContext> - 返回处理完成的上下文对象
 */
export declare const runPipeline: (context: FlowContext, actions: ActionEntry[]) => Promise<FlowContext>;
//# sourceMappingURL=runner.d.ts.map