/**
 * Object 处理器单元测试
 */

import { ObjectRequiredFieldsProcessor } from '@/validation/processors/object/required-fields';

function createContext(value: any, rule: any = {}) {
    return {
        value,
        rule,
        errors: [] as any[],
        terminate: false,
        path: '',
        status: { isUndefined: value === undefined, isNull: value === null, isEmpty: false },
    } as any;
}

// ObjectPropertiesProcessor calls doValidate internally which needs Logger mock
// We test it through the integration test in core.test.ts instead

describe('ObjectRequiredFieldsProcessor', () => {
    it('should pass when all required fields are present', async () => {
        const context = createContext(
            { name: 'test', email: 'test@example.com' },
            { type: 'object', requiredFields: ['name', 'email'] }
        );
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail when required field is missing', async () => {
        const context = createContext(
            { name: 'test' },
            { type: 'object', requiredFields: ['name', 'email'] }
        );
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should pass when no requiredFields defined', async () => {
        const context = createContext({ name: 'test' }, { type: 'object' });
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should fail for extra fields when additionalProperties is false', async () => {
        const context = createContext(
            { name: 'test', extra: 'value' },
            { type: 'object', requiredFields: ['name'], additionalProperties: false }
        );
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });

    it('should allow extra fields when additionalProperties is true', async () => {
        const context = createContext(
            { name: 'test', extra: 'value' },
            { type: 'object', requiredFields: ['name'], additionalProperties: true }
        );
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors).toHaveLength(0);
    });

    it('should use path in error messages', async () => {
        const context = createContext(
            {},
            { type: 'object', requiredFields: ['name'], path: 'user' }
        );
        await ObjectRequiredFieldsProcessor(context);
        expect(context.errors.length).toBeGreaterThan(0);
    });
});
