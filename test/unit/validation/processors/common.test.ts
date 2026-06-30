/**
 * Common 处理器单元测试
 */

import { TransformProcessor } from '@/validation/processors/common/transform';
import { PresenceProcessor } from '@/validation/processors/common/presence';

function createContext(value: any, rule: any = {}) {
    return {
        value,
        rule,
        errors: [] as any[],
        terminate: false,
        path: '',
        status: {
            isUndefined: value === undefined,
            isNull: value === null,
            isEmpty: value === '' || (Array.isArray(value) && value.length === 0),
        },
    } as any;
}

describe('TransformProcessor', () => {
    it('should apply default value when value is undefined', async () => {
        const context = createContext(undefined, { type: 'string', default: 'fallback' });
        await TransformProcessor(context);
        expect(context.value).toBe('fallback');
    });

    it('should not apply default when value is defined', async () => {
        const context = createContext('hello', { type: 'string', default: 'fallback' });
        await TransformProcessor(context);
        expect(context.value).toBe('hello');
    });

    it('should trim string by default', async () => {
        const context = createContext('  hello  ', { type: 'string' });
        await TransformProcessor(context);
        expect(context.value).toBe('hello');
    });

    it('should not trim when rule.trim is false', async () => {
        const context = createContext('  hello  ', { type: 'string', trim: false });
        await TransformProcessor(context);
        expect(context.value).toBe('  hello  ');
    });

    it('should apply transform function', async () => {
        const context = createContext('123', { type: 'string', transform: (v: string) => Number(v) });
        await TransformProcessor(context);
        expect(context.value).toBe(123);
    });

    it('should not trim non-string values', async () => {
        const context = createContext(123, { type: 'number' });
        await TransformProcessor(context);
        expect(context.value).toBe(123);
    });
});

describe('PresenceProcessor', () => {
    it('should fail when required and value is undefined', async () => {
        const context = createContext(undefined, { type: 'string', required: true });
        await PresenceProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should pass when not required and value is undefined', async () => {
        const context = createContext(undefined, { type: 'string', required: false });
        await PresenceProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when value is null and not nullable', async () => {
        const context = createContext(null, { type: 'string', nullable: false });
        await PresenceProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
        expect(context.terminate).toBe(true);
    });

    it('should pass when value is null and nullable', async () => {
        const context = createContext(null, { type: 'string', nullable: true });
        await PresenceProcessor(context);
        expect(context.errors).toHaveLength(0);
        expect(context.terminate).toBe(true);
    });

    it('should fail when empty is false and value is empty string', async () => {
        const context = createContext('', { type: 'string', empty: false });
        context.status.isEmpty = true;
        await PresenceProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass when empty is not false and value is empty string', async () => {
        const context = createContext('', { type: 'string' });
        context.status.isEmpty = true;
        await PresenceProcessor(context);
        expect(context.errors).toHaveLength(0);
    });
});
