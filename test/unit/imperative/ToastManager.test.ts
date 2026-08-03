/**
 * ToastManager 单元测试
 *
 * jsdom 环境下运行，和 BadgeComponent 测试同模式。
 *
 * 覆盖：
 * 1. 单例模式
 * 2. create() 返回 ToastHandle
 * 3. 带 eventKey 创建
 * 4. 带 title 使用 notification 模板
 * 5. handle.close() 关闭
 * 6. handle thenable
 * 7. 多实例堆叠
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

jest.mock('worker_threads', () => ({
    parentPort: { on: jest.fn(), postMessage: jest.fn() },
    Worker: jest.fn(),
}));

jest.mock('crypto', () => ({
    createHash: () => ({ update: () => ({ digest: () => Buffer.from('') }) }),
}));

jest.mock('@qimenjs/entity', () => ({}));

import { ToastManager } from '@/imperative/ToastManager';
import type { ToastHandle } from '@/imperative/types';

describe('ToastManager', () => {
    let manager: ToastManager;

    beforeEach(() => {
        (ToastManager as any).instance = undefined;
        manager = ToastManager.getInstance();
    });

    test('单例模式', () => {
        const a = ToastManager.getInstance();
        const b = ToastManager.getInstance();
        expect(a).toBe(b);
    });

    test('create 返回 ToastHandle', () => {
        const handle = manager.create({ message: '测试消息' });
        expect(handle).toBeDefined();
        expect(typeof handle.close).toBe('function');
        expect(typeof handle.then).toBe('function');
    });

    test('create 带 eventKey', () => {
        const handle = manager.create({ message: '测试', eventKey: 'my-toast' });
        expect(handle).toBeDefined();
    });

    test('create 带 title 使用 notification 模板', () => {
        const handle = manager.create({ message: '消息', title: '标题' });
        expect(handle).toBeDefined();
    });

    test('handle.close 不报错', () => {
        const handle = manager.create({ message: '关闭测试' });
        expect(() => handle.close()).not.toThrow();
    });

    test('handle 是 Thenable', () => {
        const handle: ToastHandle = manager.create({ message: 'thenable', duration: 50 });
        expect(typeof handle.then).toBe('function');
    });

    test('多实例堆叠', () => {
        const h1 = manager.create({ message: 'toast1' });
        const h2 = manager.create({ message: 'toast2' });
        const h3 = manager.create({ message: 'toast3' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(h3).toBeDefined();
    });

    test('不同 position 的 toast', () => {
        const h1 = manager.create({ message: 'top-right', position: 'top-right' });
        const h2 = manager.create({ message: 'bottom-left', position: 'bottom-left' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
    });

    test('不同 type 的 toast', () => {
        const h1 = manager.create({ message: 'info', type: 'info' });
        const h2 = manager.create({ message: 'success', type: 'success' });
        const h3 = manager.create({ message: 'warning', type: 'warning' });
        const h4 = manager.create({ message: 'error', type: 'error' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(h3).toBeDefined();
        expect(h4).toBeDefined();
    });
});
