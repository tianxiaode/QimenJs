import { HashTaskHealthMonitor } from '../../../../src/tasks/hash-task/hash/HashTaskHealthMonitor';
import { HashTaskState } from '../../../../src/tasks/hash-task/hash/HashTaskState';
import { HashTaskProgress } from '../../../../src/tasks/hash-task/hash/HashTaskProgress';
import { HashTaskResources } from '../../../../src/tasks/hash-task/hash/HashTaskResources';
import { MemoryManager } from '../../../../src/runtime-env/memory';
import { DefaultWorkerPool } from '../../../../src/tasks/hash-task/worker/DefaultWorkerPool';

describe('HashTaskHealthMonitor', () => {
    let state: HashTaskState;
    let progress: HashTaskProgress;
    let resources: HashTaskResources;
    let memoryManager: MemoryManager;
    let workerPool: DefaultWorkerPool;

    beforeEach(() => {
        state = new HashTaskState();
        progress = new HashTaskProgress();
        memoryManager = new MemoryManager({ maxBytes: 1024 * 1024 * 100 }); // 100MB
        workerPool = new DefaultWorkerPool();
        resources = new HashTaskResources(memoryManager, workerPool);
    });

    test('should detect progress update when processedBytes changes', () => {
        // 创建监控器
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为运行中
        state.start();
        
        // 设置初始进度
        progress['processedBytes'] = 100;
        
        // 模拟processedBytes变化
        progress['processedBytes'] = 200;
        
        // 执行检查
        (monitor as any).check();
        
        // 验证进度已更新
        expect((monitor as any).lastProgressBytes).toBe(200);
        
        monitor.stop(); // 确保清理
    });

    test('should detect stalled progress when processedBytes does not change', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为运行中
        state.start();
        
        // 设置初始进度
        progress['processedBytes'] = 100;
        
        // 手动设置lastProgressTime足够久以前，以便触发stall检测
        (monitor as any).lastProgressTime = Date.now() - 200;
        (monitor as any).lastProgressBytes = 100;
        
        // 模拟processedBytes没有变化
        progress['processedBytes'] = 100;
        
        // 监听stalled事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证stalled事件被触发
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'stalled',
            durationMs: expect.any(Number)
        });
        
        monitor.stop(); // 确保清理
    });

    test('should detect worker unresponsive when stalled and has worker', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为运行中
        state.start();
        
        // 模拟资源中有worker
        resources['worker'] = {} as any;
        resources['acquired'] = true;
        
        // 手动设置lastProgressTime足够久以前，以便触发stall检测
        (monitor as any).lastProgressTime = Date.now() - 200;
        (monitor as any).lastProgressBytes = 100;
        
        // 模拟processedBytes没有变化
        progress['processedBytes'] = 100;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证两个事件都被触发
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'stalled',
            durationMs: expect.any(Number)
        });
        
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'worker_unresponsive'
        });
        
        monitor.stop(); // 确保清理
    });

    test('should detect resource leak when task is completed but still has worker', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为完成
        state['status'] = 'completed' as any;
        
        // 模拟资源中有worker
        resources['worker'] = {} as any;
        resources['acquired'] = true;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证resource leak事件被触发
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'resource_leak'
        });
        
        monitor.stop(); // 确保清理
    });

    test('should detect resource leak when task is failed but still has worker', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为失败
        state['status'] = 'failed' as any;
        
        // 模拟资源中有worker
        resources['worker'] = {} as any;
        resources['acquired'] = true;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证resource leak事件被触发
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'resource_leak'
        });
        
        monitor.stop(); // 确保清理
    });

    test('should detect resource leak when task is cancelled but still has worker', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为取消
        state['status'] = 'cancelled' as any;
        
        // 模拟资源中有worker
        resources['worker'] = {} as any;
        resources['acquired'] = true;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证resource leak事件被触发
        expect(eventHandler).toHaveBeenCalledWith({
            type: 'resource_leak'
        });
        
        monitor.stop(); // 确保清理
    });

    test('should not check for stall when task is not running', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为非运行状态
        state['status'] = 'idle' as any;
        
        // 手动设置lastProgressTime足够久以前
        (monitor as any).lastProgressTime = Date.now() - 200;
        (monitor as any).lastProgressBytes = 100;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证没有事件被触发
        expect(eventHandler).not.toHaveBeenCalled();
        
        monitor.stop(); // 确保清理
    });

    test('should handle multiple listeners and emit to all', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为运行中
        state.start();
        
        // 手动设置lastProgressTime足够久以前，以便触发stall检测
        (monitor as any).lastProgressTime = Date.now() - 200;
        (monitor as any).lastProgressBytes = 100;
        
        // 模拟processedBytes没有变化
        progress['processedBytes'] = 100;
        
        // 添加多个监听器
        const eventHandler1 = jest.fn();
        const eventHandler2 = jest.fn();
        monitor.onEvent(eventHandler1);
        monitor.onEvent(eventHandler2);
        
        // 执行检查
        (monitor as any).check();
        
        // 验证两个监听器都被调用
        expect(eventHandler1).toHaveBeenCalledWith({
            type: 'stalled',
            durationMs: expect.any(Number)
        });
        
        expect(eventHandler2).toHaveBeenCalledWith({
            type: 'stalled',
            durationMs: expect.any(Number)
        });
        
        monitor.stop(); // 确保清理
    });

    test('should prevent duplicate events after stall detection', () => {
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 设置任务状态为运行中
        state.start();
        
        // 手动设置lastProgressTime足够久以前，以便触发stall检测
        (monitor as any).lastProgressTime = Date.now() - 200;
        (monitor as any).lastProgressBytes = 100;
        
        // 模拟processedBytes没有变化
        progress['processedBytes'] = 100;
        
        // 监听事件
        const eventHandler = jest.fn();
        monitor.onEvent(eventHandler);
        
        // 执行两次检查
        (monitor as any).check();
        (monitor as any).check();
        
        // 验证事件只被触发一次（因为第二次会更新lastProgressTime防止重复事件）
        expect(eventHandler).toHaveBeenCalledTimes(1);
        
        monitor.stop(); // 确保清理
    });
    
    test('should create monitor with default options', () => {
        // 直接调用构造函数，不传入options参数，以测试默认值
        const monitor = new HashTaskHealthMonitor(state, progress, resources);
        
        // 验证默认值
        expect((monitor as any).stallThresholdMs).toBe(10000); // 10_000
        expect((monitor as any).intervalMs).toBe(1000); // 1_000
        
        monitor.stop(); // 确保清理
    });

    test('should not start timer if already started', () => {
        // 创建监控器并启动
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 首先启动监控器
        monitor.start();
        
        // 保存第一个定时器ID
        const initialTimer = (monitor as any).timer;
        expect(initialTimer).toBeDefined();
        
        // 再次调用start，应该不创建新的定时器
        monitor.start();
        
        // 验证定时器ID没有改变
        expect((monitor as any).timer).toBe(initialTimer);
        
        monitor.stop(); // 确保清理
    });
    
    test('should stop timer if it exists', () => {
        // 创建监控器并启动
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 启动监控器
        monitor.start();
        expect((monitor as any).timer).toBeDefined();
        
        // 停止监控器
        monitor.stop();
        
        // 验证定时器已被清除
        expect((monitor as any).timer).toBeUndefined();
    });
    
    test('should handle stop when timer does not exist', () => {
        // 创建监控器但不启动
        const monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 100,
            intervalMs: 10
        });
        
        // 直接停止监控器（没有启动）
        expect(() => {
            monitor.stop();
        }).not.toThrow();
        
        // 验证定时器仍然不存在
        expect((monitor as any).timer).toBeUndefined();
    });
});