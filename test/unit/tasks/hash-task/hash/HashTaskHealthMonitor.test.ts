import { HashTaskHealthMonitor } from '@/tasks/hash-task/hash/HashTaskHealthMonitor';
import { HashTaskState } from '@/tasks/hash-task/hash/HashTaskState';
import { HashTaskProgress } from '@/tasks/hash-task/hash/HashTaskProgress';
import { HashTaskResources } from '@/tasks/hash-task/hash/HashTaskResources';

// Mock the dependencies
jest.useFakeTimers();

describe('HashTaskHealthMonitor', () => {
    let monitor: HashTaskHealthMonitor;
    let state: HashTaskState;
    let progress: HashTaskProgress;
    let resources: HashTaskResources;
    let mockOnEvent: jest.Mock;

    beforeEach(() => {
        state = new HashTaskState();
        progress = new HashTaskProgress();
        resources = new HashTaskResources({} as any, {} as any); // Mock as needed
        monitor = new HashTaskHealthMonitor(state, progress, resources, {
            stallThresholdMs: 1000,
            intervalMs: 100
        });
        
        mockOnEvent = jest.fn();
        monitor.onEvent(mockOnEvent);
    });

    afterEach(() => {
        monitor.stop();
        jest.clearAllTimers();
    });

    describe('constructor', () => {
        it('should initialize with default options', () => {
            const defaultMonitor = new HashTaskHealthMonitor(state, progress, resources);
            const internalProps = (defaultMonitor as any);
            expect(internalProps.stallThresholdMs).toBe(10000);
            expect(internalProps.intervalMs).toBe(1000);
        });

        it('should initialize with provided options', () => {
            const customMonitor = new HashTaskHealthMonitor(state, progress, resources, {
                stallThresholdMs: 5000,
                intervalMs: 500
            });
            const internalProps = (customMonitor as any);
            expect(internalProps.stallThresholdMs).toBe(5000);
            expect(internalProps.intervalMs).toBe(500);
        });
    });

    describe('start', () => {
        it('should start the health check interval', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            monitor.start();
            
            expect(setIntervalSpy).toHaveBeenCalled();
            setIntervalSpy.mockRestore();
        });

        it('should not start if already started', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            monitor.start();
            monitor.start(); // Second call should be ignored
            
            expect(setIntervalSpy).toHaveBeenCalledTimes(1);
            setIntervalSpy.mockRestore();
        });
    });

    describe('stop', () => {
        it('should clear the interval when stopped', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            monitor.start();
            monitor.stop();
            
            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
    });

    describe('health checks', () => {
        it('should detect stalled progress when running for too long without progress', () => {
            state['status'] = 'running' as any;
            monitor.start();
            
            // Advance time by more than the threshold
            jest.advanceTimersByTime(1500);
            
            expect(mockOnEvent).toHaveBeenCalledWith({ type: 'stalled', durationMs: expect.any(Number) });
        });

        it('should not detect stalled progress when not running', () => {
            state['status'] = 'idle' as any;
            monitor.start();
            
            jest.advanceTimersByTime(1500);
            
            expect(mockOnEvent).not.toHaveBeenCalled();
        });

        it('should detect worker unresponsive when stalled and has worker', () => {
            state['status'] = 'running' as any;
            // Simulate that resources has a worker
            const resourcesWithWorker = {
                snapshot: () => ({ hasWorker: true })
            };
            monitor = new HashTaskHealthMonitor(state, progress, resourcesWithWorker as any, {
                stallThresholdMs: 1000,
                intervalMs: 100
            });
            monitor.onEvent(mockOnEvent);
            
            monitor.start();
            jest.advanceTimersByTime(1500);
            
            expect(mockOnEvent).toHaveBeenCalledWith({ type: 'stalled', durationMs: expect.any(Number) });
            expect(mockOnEvent).toHaveBeenCalledWith({ type: 'worker_unresponsive' });
        });

        it('should detect resource leak when task is finished but still has worker', () => {
            state['status'] = 'completed' as any;
            // Simulate that resources still has a worker
            const resourcesWithWorker = {
                snapshot: () => ({ hasWorker: true })
            };
            monitor = new HashTaskHealthMonitor(state, progress, resourcesWithWorker as any, {
                stallThresholdMs: 1000,
                intervalMs: 100
            });
            monitor.onEvent(mockOnEvent);
            
            monitor.start();
            jest.advanceTimersByTime(100);
            
            expect(mockOnEvent).toHaveBeenCalledWith({ type: 'resource_leak' });
        });

        it('should not detect resource leak when task is finished and has no worker', () => {
            state['status'] = 'completed' as any;
            // Simulate that resources has no worker
            const resourcesWithoutWorker = {
                snapshot: () => ({ hasWorker: false })
            };
            monitor = new HashTaskHealthMonitor(state, progress, resourcesWithoutWorker as any, {
                stallThresholdMs: 1000,
                intervalMs: 100
            });
            monitor.onEvent(mockOnEvent);
            
            monitor.start();
            jest.advanceTimersByTime(100);
            
            expect(mockOnEvent).not.toHaveBeenCalled();
        });
    });

    describe('onEvent', () => {
        it('should add event listener and return remove function', () => {
            const listener = jest.fn();
            const removeFn = monitor.onEvent(listener);
            
            state['status'] = 'running' as any;
            monitor.start();
            jest.advanceTimersByTime(1500);
            
            expect(listener).toHaveBeenCalled();
            
            // Remove the listener and verify it's not called anymore
            removeFn();
            jest.advanceTimersByTime(1500);
            expect(listener).toHaveBeenCalledTimes(1); // Should not increase
        });
    });
});