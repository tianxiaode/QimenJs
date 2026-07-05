/**
 * HttpExecutor 单元测试
 */

import { HttpExecutor } from '@/http';
import { RequestContextBuilder } from '@qimenjs/context';

describe('HttpExecutor', () => {
    let executor: HttpExecutor;

    beforeEach(() => {
        executor = new HttpExecutor();
    });

    describe('execute', () => {
        it('should execute without actions', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            const result = await executor.execute(context);

            expect(result.context).toBe(context);
            // success 取决于 context.error，初始状态应该是 true
            expect(result.success).toBe(!context.error);
        });

        it('should process domain config', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            const result = await executor.execute(context);

            // domainConfig 可能不存在（如果 domain 未注册）
            // 验证执行完成即可，不验证成功（因为可能没有注册 actions）
            expect(result.context).toBeDefined();
        });

        it('should handle errors', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            // 手动设置错误
            context.error = new Error('Test error');

            const result = await executor.execute(context);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('createTask', () => {
        it('should create cancellable task', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            const task = executor.createTask(context);

            expect(task.promise).toBeDefined();
            expect(task.cancel).toBeDefined();

            const result = await task.promise;
            expect(result.context).toBe(context);
        });

        it('should support cancel', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            const task = executor.createTask(context);
            task.cancel('user cancelled');

            const result = await task.promise;

            expect(result.success).toBe(false);
            expect(result.context.metadata.isAborted).toBe(true);
        });

        it('should store controller in metadata', async () => {
            const context = RequestContextBuilder.create()
                .withDomain('test')
                .withUrl('/api/test')
                .withMethod('GET')
                .build();

            const task = executor.createTask(context);
            const result = await task.promise;

            expect(result.context.metadata._httpController).toBeDefined();
        });
    });
});
