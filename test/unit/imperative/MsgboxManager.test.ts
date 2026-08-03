/**
 * MsgboxManager 单元测试
 *
 * jsdom 环境下运行，和 BadgeComponent 测试同模式。
 *
 * 覆盖：
 * 1. 单例模式
 * 2. create() 返回 Promise
 * 3. alert / confirm / prompt 三种类型
 * 4. 带 eventKey 创建
 * 5. 自定义按钮文本
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

import { MsgboxManager } from '@/imperative/MsgboxManager';

describe('MsgboxManager', () => {
    let manager: MsgboxManager;

    beforeEach(() => {
        (MsgboxManager as any).instance = undefined;
        manager = MsgboxManager.getInstance();
    });

    test('单例模式', () => {
        const a = MsgboxManager.getInstance();
        const b = MsgboxManager.getInstance();
        expect(a).toBe(b);
    });

    test('create alert 返回 Promise', () => {
        const result = manager.create({ type: 'alert', title: '提示' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create confirm 返回 Promise', () => {
        const result = manager.create({ type: 'confirm', title: '确认？' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create prompt 返回 Promise', () => {
        const result = manager.create({ type: 'prompt', title: '请输入' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带 eventKey', () => {
        const result = manager.create({
            type: 'confirm',
            title: '确认？',
            eventKey: 'delete-confirm',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带自定义按钮文本', () => {
        const result = manager.create({
            type: 'confirm',
            title: '删除确认',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create prompt 带 inputPlaceholder', () => {
        const result = manager.create({
            type: 'prompt',
            title: '请输入名称',
            inputPlaceholder: '名称',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带 content', () => {
        const result = manager.create({
            type: 'alert',
            title: '错误',
            content: '操作失败，请重试',
        });
        expect(result).toBeInstanceOf(Promise);
    });
});
