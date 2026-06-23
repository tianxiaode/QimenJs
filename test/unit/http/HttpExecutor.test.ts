/**
 * HttpExecutor 单元测试
 */

import { HttpExecutor } from '@/http';
import { RequestContextBuilder, type RequestContext } from '@orbitjs/context';

describe('HttpExecutor', () => {
    let executor: HttpExecutor;
    
    beforeEach(() => {
        executor = new HttpExecutor();
    });
    
    describe('addProcessor', () => {
        it('should add processor', () => {
            const processor = {
                name: 'TestProcessor',
                execute: async (ctx: RequestContext) => {
                    ctx.metadata.test = true;
                },
            };
            
            executor.addProcessor(processor);
            expect(executor).toBeInstanceOf(HttpExecutor);
        });
        
        it('should support chaining', () => {
            executor
                .addProcessor({
                    name: 'P1',
                    execute: async () => {},
                })
                .addProcessor({
                    name: 'P2',
                    execute: async () => {},
                });
            
            expect(executor).toBeInstanceOf(HttpExecutor);
        });
    });
    
    describe('execute', () => {
        it('should execute without processors', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();
            
            const result = await executor.execute(context);
            
            expect(result.success).toBe(true);
            expect(result.context).toBe(context);
        });
        
        it('should execute with processors', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();
            
            // 使用简单的处理器，直接修改 context
            const processors = [
                {
                    name: 'P1',
                    weight: 100,
                    execute: (ctx: RequestContext) => {
                        ctx.metadata.p1 = true;
                        return Promise.resolve();
                    },
                },
            ];
            
            const result = await executor.execute(context, processors);
            
            // 检查处理器是否执行
            expect(result.context.metadata.p1).toBe(true);
        });
        
        it('should handle processor error', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();
            
            const processors = [
                {
                    name: 'ErrorProcessor',
                    execute: async (ctx: RequestContext) => {
                        throw new Error('Processor failed');
                    },
                },
            ];
            
            const result = await executor.execute(context, processors);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
    
    describe('createTask', () => {
        it('should create cancellable task', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();
            
            const task = executor.createTask(context);
            const result = await task.promise;
            
            expect(result.success).toBe(true);
        });
        
        it('should support cancel', async () => {
            const context = RequestContextBuilder
                .create()
                .withDomain('user')
                .withUrl('/api/users')
                .withMethod('GET')
                .build();
            
            const task = executor.createTask(context);
            task.cancel('user cancelled');
            
            const result = await task.promise;
            
            expect(result.success).toBe(false);
            expect(result.context.metadata.isAborted).toBe(true);
        });
    });
});
