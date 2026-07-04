/**
 * ValidatorRegistrar 单元测试
 *
 * 覆盖：
 * 1. register / unregister
 * 2. get（缓存、排序、tag 过滤）
 * 3. lock
 * 4. doInspect / getStageName
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
            }))
        }
    };
});

import { ValidatorRegistrar } from '@/validation/core/ValidatorRegistrar';
import type { ValidationProcessorEntry } from '@/validation/types';
import { ValidationWeight } from '@/validation/types/processor';

// ============================================
// 辅助
// ============================================

function createEntry(name: string, tags: string[], weight: ValidationWeight, offset = 0): ValidationProcessorEntry {
    return {
        name,
        tags: tags as any,
        weight,
        offset,
        execute: jest.fn().mockResolvedValue(undefined),
    };
}

// ============================================
// 测试
// ============================================

describe('ValidatorRegistrar', () => {
    let registrar: ValidatorRegistrar;

    beforeEach(() => {
        registrar = new ValidatorRegistrar();
    });

    describe('register', () => {
        it('应注册处理器到 storage', () => {
            const entry = createEntry('test-processor', ['string'], ValidationWeight.SEMANTIC);
            registrar.register(entry);
            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(1);
            expect(pipeline[0].name).toBe('test-processor');
        });

        it('注册新条目后应清空缓存', () => {
            const entry1 = createEntry('p1', ['string'], ValidationWeight.SEMANTIC);
            registrar.register(entry1);
            registrar.get('string'); // 填充缓存

            const entry2 = createEntry('p2', ['string'], ValidationWeight.QUANTITY);
            registrar.register(entry2);
            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(2);
        });
    });

    describe('unregister', () => {
        it('应移除指定名称的处理器', () => {
            const entry1 = createEntry('p1', ['string'], ValidationWeight.SEMANTIC);
            const entry2 = createEntry('p2', ['string'], ValidationWeight.QUANTITY);
            registrar.register(entry1);
            registrar.register(entry2);

            registrar.unregister('p1');
            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(1);
            expect(pipeline[0].name).toBe('p2');
        });

        it('移除后应清空缓存', () => {
            const entry = createEntry('p1', ['string'], ValidationWeight.SEMANTIC);
            registrar.register(entry);
            registrar.get('string'); // 填充缓存

            registrar.unregister('p1');
            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(0);
        });
    });

    describe('get', () => {
        it('空 type 应使用 "any"', () => {
            const entry = createEntry('p1', ['any'], ValidationWeight.SEMANTIC);
            registrar.register(entry);

            const pipeline = registrar.get('');
            expect(pipeline).toHaveLength(1);
        });

        it('应按 weight+offset 排序', () => {
            registrar.register(createEntry('heavy', ['string'], ValidationWeight.STRUCTURAL));
            registrar.register(createEntry('light', ['string'], ValidationWeight.PREPARATION));
            registrar.register(createEntry('mid', ['string'], ValidationWeight.SEMANTIC));

            const pipeline = registrar.get('string');
            expect(pipeline[0].name).toBe('light');
            expect(pipeline[1].name).toBe('mid');
            expect(pipeline[2].name).toBe('heavy');
        });

        it('应同时匹配特定 tag 和 "any" tag', () => {
            registrar.register(createEntry('any-processor', ['any'], ValidationWeight.SEMANTIC));
            registrar.register(createEntry('string-processor', ['string'], ValidationWeight.QUANTITY));

            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(2);
        });

        it('应使用缓存避免重复计算', () => {
            registrar.register(createEntry('p1', ['string'], ValidationWeight.SEMANTIC));

            const pipeline1 = registrar.get('string');
            const pipeline2 = registrar.get('string');
            expect(pipeline1).toBe(pipeline2); // 同一引用
        });

        it('无匹配 tag 时应返回空数组', () => {
            registrar.register(createEntry('p1', ['number'], ValidationWeight.SEMANTIC));
            const pipeline = registrar.get('string');
            expect(pipeline).toHaveLength(0);
        });
    });

    describe('lock', () => {
        it('锁定后注册应抛出异常', () => {
            registrar.lock();
            expect(() => registrar.register(createEntry('p1', ['string'], ValidationWeight.SEMANTIC))).toThrow();
        });

        it('锁定后注销应抛出异常', () => {
            registrar.register(createEntry('p1', ['string'], ValidationWeight.SEMANTIC));
            registrar.lock();
            expect(() => registrar.unregister('p1')).toThrow();
        });
    });

    describe('doInspect', () => {
        it('应输出管道信息到控制台', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation();
            const tableSpy = jest.spyOn(console, 'table').mockImplementation();

            registrar.register(createEntry('presence', ['string'], ValidationWeight.PRESENCE));
            registrar.inspect();

            expect(logSpy).toHaveBeenCalled();
            expect(tableSpy).toHaveBeenCalled();

            logSpy.mockRestore();
            tableSpy.mockRestore();
        });
    });
});
