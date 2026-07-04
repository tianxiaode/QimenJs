/**
 * HttpExecutor 核心类
 * 
 * 负责执行 HTTP 请求的核心逻辑
 * - 接收 RequestContext
 * - 处理 domain 配置
 * - 从 HttpActionRegistrar 获取 actions
 * - 执行管道
 * - 返回处理后的上下文
 */

import type { RequestContext } from '@qimenjs/context';
import { pipeline } from '@qimenjs/pipeline';
import { Registry } from '@qimenjs/registry';
import { HttpActionRegistrar, type HttpActionEntry } from './HttpActionRegistrar';

/**
 * HTTP 执行结果
 */
export interface HttpExecutionResult {
    /**
     * 执行后的上下文
     */
    context: RequestContext;
    
    /**
     * 是否成功
     */
    success: boolean;
    
    /**
     * 错误信息（如果有）
     */
    error?: any;
}

/**
 * HttpExecutor 核心类
 */
export class HttpExecutor {
    /**
     * 处理 domain 配置
     * 
     * @param context - 请求上下文
     * @deprecated Domain 配置已在 RequestContextBuilder.build() 中获取并缓存
     */
    private processDomainConfig(context: RequestContext): void {
        // Domain 配置已在 RequestContextBuilder.build() 中获取并缓存到 context.metadata.domainConfig
        // 这里不需要再做任何处理
    }
    
    /**
     * 获取 actions 列表
     * 
     * @returns actions 列表
     */
    private getActions(): HttpActionEntry[] {
        const registrar = HttpActionRegistrar.getInstance();
        return registrar.getPipeline();
    }
    
    /**
     * 执行 HTTP 请求
     * 
     * @param context - 请求上下文
     * @returns 执行结果
     */
    async execute(context: RequestContext): Promise<HttpExecutionResult> {
        try {
            // 处理 domain 配置
            this.processDomainConfig(context);
            
            // 获取 actions
            const actions = this.getActions();
            
            // 如果有 actions，执行管道
            if (actions.length > 0) {
                // 转换为 pipeline 需要的格式
                const processors = actions.map(action => ({
                    name: action.name,
                    weight: action.category,
                    offset: action.offset,
                    execute: async (ctx: RequestContext) => {
                        await action.handler(ctx);
                    },
                }));
                
                // 执行管道
                await pipeline.execute(context, processors);
            }
            
            return {
                context,
                success: !context.error,
                error: context.error,
            };
        } catch (error) {
            // 捕获执行过程中的错误
            context.error = error;
            return {
                context,
                success: false,
                error,
            };
        }
    }
    
    /**
     * 创建可取消的执行任务
     * 
     * @param context - 请求上下文
     * @returns 包含 promise 和 cancel 方法的对象
     */
    createTask(context: RequestContext): {
        promise: Promise<HttpExecutionResult>;
        cancel: (reason?: string) => void;
    } {
        const controller = new AbortController();
        
        // 将 controller 存储到 context.metadata
        context.metadata._httpController = controller;
        
        const promise = new Promise<HttpExecutionResult>((resolve) => {
            // 监听取消事件
            controller.signal.addEventListener('abort', () => {
                context.metadata.isAborted = true;
                resolve({
                    context,
                    success: false,
                    error: new Error('Request cancelled'),
                });
            });
            
            // 执行请求
            this.execute(context).then(resolve);
        });
        
        return {
            promise,
            cancel: (reason?: string) => {
                controller.abort(reason || 'user_cancelled');
            },
        };
    }
}
