/**
 * FileProcessor 独立单元测试
 *
 * 验证文件校验处理器的核心行为：
 * 1. minFiles / maxFiles 集合级校验
 * 2. maxSize / allowedTypes 元素级校验
 * 3. 非 File 实例类型检查
 * 4. allErrors 模式
 * 5. 单个文件（非数组）输入
 */

jest.mock('@orbitjs/mime', () => ({
    MimeTypeRegistrar: {
        getInstance: jest.fn(() => ({
            get: jest.fn((types: string[]) => new Set(types)),
        })),
    },
}));

import { FileProcessor } from '@/validation/processors/file/file';
import type { ValidationContext } from '@/validation/types';

// ============================================
// 辅助
// ============================================

// MockFile 模拟 File 对象，但不是真正的 File 实例
class MockFile {
    constructor(
        public name: string,
        public size: number,
        public type: string,
    ) {}
}

// 使用全局 File 构造函数创建真正的 File 实例
function createRealFile(name: string, size: number, type: string): File {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], name, { type });
}

function createContext(value: any, rule: any): ValidationContext {
    return {
        value,
        rawValue: value,
        rule: { allErrors: false, path: '', ...rule },
        errors: [],
        status: {
            isUndefined: false,
            isNull: false,
            isNaN: false,
            isEmpty: false,
            isModified: false,
        },
    } as any;
}

// ============================================
// 测试
// ============================================

describe('FileProcessor', () => {
    it('文件数量少于 minFiles 时应报错', async () => {
        const ctx = createContext([createRealFile('a.pdf', 100, 'application/pdf')], { minFiles: 2 });
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
        expect(ctx.errors[0].code).toBe('VALIDATION_TOO_SMALL');
    });

    it('文件数量超过 maxFiles 时应报错', async () => {
        const ctx = createContext(
            [createRealFile('a.pdf', 100, 'application/pdf'), createRealFile('b.pdf', 100, 'application/pdf'), createRealFile('c.pdf', 100, 'application/pdf')],
            { maxFiles: 2 },
        );
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
        expect(ctx.errors[0].code).toBe('VALIDATION_TOO_LARGE');
    });

    it('文件大小超过 maxSize 时应报错', async () => {
        const ctx = createContext([createRealFile('a.pdf', 200, 'application/pdf')], { maxSize: 100 });
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
        expect(ctx.errors[0].code).toBe('VALIDATION_TOO_LARGE');
    });

    it('文件类型不在 allowedTypes 中时应报错', async () => {
        const ctx = createContext([createRealFile('a.png', 100, 'image/png')], { allowedTypes: ['application/pdf'] });
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
        expect(ctx.errors[0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('非 File 实例应报 VALIDATION_TYPE_MISMATCH 错误', async () => {
        const ctx = createContext([new MockFile('not-a-file', 100, 'text/plain')], { maxSize: 200 });
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThan(0);
        expect(ctx.errors[0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('allErrors=true 时应收集所有错误', async () => {
        const ctx = createContext(
            [createRealFile('a.png', 200, 'image/png'), createRealFile('b.png', 300, 'image/png')],
            { maxSize: 100, allErrors: true },
        );
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('allErrors=false 时应在首个错误处中断', async () => {
        const ctx = createContext(
            [createRealFile('a.png', 200, 'image/png'), createRealFile('b.png', 300, 'image/png')],
            { maxSize: 100, allErrors: false },
        );
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBe(1);
    });

    it('单个文件（非数组）输入应正常处理', async () => {
        const file = createRealFile('a.pdf', 100, 'application/pdf');
        const ctx = createContext(file, { maxSize: 200 });
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBe(0);
    });

    it('所有校验通过时不应有错误', async () => {
        const ctx = createContext(
            [createRealFile('a.pdf', 100, 'application/pdf'), createRealFile('b.pdf', 50, 'application/pdf')],
            { minFiles: 1, maxFiles: 5, maxSize: 200, allowedTypes: ['application/pdf'] },
        );
        await FileProcessor(ctx);
        expect(ctx.errors.length).toBe(0);
    });
});
