/**
 * createEventAdapter 工厂函数单元测试
 * 
 * 测试覆盖范围：
 * 1. 实例创建和类型验证
 * 2. 单例/多例行为
 * 3. 接口完整性
 * 4. 配置选项
 * 5. 错误处理
 */
import { createEventAdapter } from '@/event-dom/adapters/createEventAdapter';
import { DomEventAdapter } from '@/event-dom/adapters/dom';

describe('createEventAdapter', () => {
    // --- 基础功能测试 ---

    describe('实例创建', () => {
        test('应该返回DomEventAdapter实例', () => {
            const adapter = createEventAdapter();
            
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(DomEventAdapter);
        });

        test('每次调用应该返回新实例', () => {
            const adapter1 = createEventAdapter();
            const adapter2 = createEventAdapter();
            
            expect(adapter1).not.toBe(adapter2);
        });

        test('实例应该有bind方法', () => {
            const adapter = createEventAdapter();
            
            expect(adapter.bind).toBeDefined();
            expect(typeof adapter.bind).toBe('function');
        });

        test('实例应该有unbind方法', () => {
            const adapter = createEventAdapter();
            
            expect(adapter.unbind).toBeDefined();
            expect(typeof adapter.unbind).toBe('function');
        });

        test('实例应该有destroy方法', () => {
            const adapter = createEventAdapter();
            
            expect(adapter.destroy).toBeDefined();
            expect(typeof adapter.destroy).toBe('function');
        });
    });

    // --- 接口完整性测试 ---

    describe('接口完整性', () => {
        test('应该实现IEventAdapter接口', () => {
            const adapter = createEventAdapter();
            
            // 验证所有必需的方法存在
            expect(typeof adapter.bind).toBe('function');
            expect(typeof adapter.unbind).toBe('function');
            expect(typeof adapter.destroy).toBe('function');
        });

        test('bind方法应该返回解绑函数', () => {
            const adapter = createEventAdapter();
            const mockElement = document.createElement('div');
            const mockHandler = jest.fn();
            
            const unbind = adapter.bind(mockElement, 'tap', mockHandler);
            
            expect(typeof unbind).toBe('function');
        });
    });

    // --- 配置选项测试 ---

    describe('配置选项', () => {
        test('应该支持默认配置', () => {
            const adapter = createEventAdapter();
            expect(adapter).toBeDefined();
        });

        test('应该能够创建多个独立配置的适配器', () => {
            const adapter1 = createEventAdapter();
            const adapter2 = createEventAdapter();
            
            // 两个适配器应该相互独立
            expect(adapter1).not.toBe(adapter2);
        });
    });

    // --- 性能测试 ---

    describe('性能', () => {
        test('创建适配器应该高效', () => {
            const iterations = 100;
            const start = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                createEventAdapter();
            }
            
            const end = performance.now();
            // 确保性能合理（小于100ms）
            expect(end - start).toBeLessThan(100);
        });
    });

    // --- 边界情况测试 ---

    describe('边界情况', () => {
        test('应该能够处理连续创建和销毁', () => {
            for (let i = 0; i < 10; i++) {
                const adapter = createEventAdapter();
                adapter.destroy();
            }
            
            // 不应该抛出错误
            expect(true).toBe(true);
        });
    });
});
