import { Logger } from '@orbitjs/logger';
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
export const runPipeline = async (
    context: FlowContext,
    actions: ActionEntry[]
): Promise<FlowContext> => {
    const logger = Logger.for(runPipeline.name);
    
    // 1. 严格排序：按 Category(4000->1000) 降序，再按 Offset(100->...) 升序
    const sortedActions = [...actions].sort((a, b) => {
        if (b.category !== a.category) {
            return b.category - a.category; // 分类大项从 4000 到 1000 跑
        }
        return (a.offset || 0) - (b.offset || 0); // 分类内部按 offset 从小到大
    });
    
    logger.debug('start pipeline');
    
    // 2. 串行执行
    for (const action of sortedActions) {
        // 如果是物理崩溃（断网/取消），后续除了解码和结算外的动作可以根据需要跳过
        // 但由于我们每个 Action 内部都有卫语句（Guard Clause），这里直接无脑 call 即可
        const startTime = Date.now();

        try {
            // 执行操作处理器
            await action.handler(context);

            // 记录执行轨迹（可选，用于调试）
            context.steps.push({
                name: action.name,
                duration: Date.now() - startTime,
                status: 'success',
            });
        } catch (error) {
            // 发生错误时记录失败状态
            context.steps.push({
                name: action.name,
                duration: Date.now() - startTime,
                status: 'failed',
            });

            // 捕获 Action 自身代码的崩溃，防止整条管线死锁
            logger.error(`Action ${action.name} crashed:`, error);
            
            // 更新上下文中的错误状态
            context.metadata.hasError = true;
            context.error = error;
            context.metadata.isTransportFailure = true;
            
            // 出错则中断后续操作的执行
            break; 
        }
    }
    
    logger.debug('pipeline finished');
    return context;
};