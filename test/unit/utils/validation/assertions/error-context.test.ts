// error-context.test.ts
import {
    createAssetErrorContext,
    getLength,
    isValidCollection,
    getCollectionText,
    ValidationErrorCode,
    InvalidInputError,
} from '@orbitjs/utils';

describe('error-context', () => {
    describe('createAssetErrorContext', () => {
        it('should create context with default options', () => {
            const context = createAssetErrorContext();
            expect(context).toBeDefined();
            expect(typeof context.throwError).toBe('function');
            expect(typeof context.createErrorParams).toBe('function');
        });

        it('should create context with custom options', () => {
            const options = {
                paramName: 'testParam',
                functionName: 'testFunction',
            };
            const context = createAssetErrorContext(options);
            expect(context).toBeDefined();
        });

        describe('throwError', () => {
            it('should throw InvalidInputError with correct parameters', () => {
                const context = createAssetErrorContext();
                const code = ValidationErrorCode.TYPE_NOT_STRING;
                const params = { value: 123 };

                try {
                    context.throwError(code, params);
                    fail('Expected error to be thrown');
                } catch (error: any) {
                    expect(error).toBeInstanceOf(InvalidInputError);
                    expect(error.code).toBe(code);
                    expect(error.context?.value).toBe(123);
                }
            });

            it('should include context options in error params', () => {
                const context = createAssetErrorContext({
                    paramName: 'testParam',
                    functionName: 'testFunction',
                });

                const code = ValidationErrorCode.MIN_LENGTH;
                const params = { min: 5 };

                try {
                    context.throwError(code, params);
                    fail('Expected error to be thrown');
                } catch (error: any) {
                    expect(error).toBeInstanceOf(InvalidInputError);
                    expect(error.context?.paramName).toBe('testParam');
                    expect(error.context?.functionName).toBe('testFunction');
                    expect(error.context?.min).toBe(5);
                }
            });

            it('should handle undefined params in throwError', () => {
                const context = createAssetErrorContext({
                    paramName: 'testParam',
                    functionName: 'testFunction',
                });

                const code = ValidationErrorCode.TYPE_NOT_STRING;

                try {
                    // 显式传递 undefined 作为第二个参数
                    context.throwError(code, undefined);
                    fail('Expected error to be thrown');
                } catch (error: any) {
                    expect(error).toBeInstanceOf(InvalidInputError);
                    expect(error.code).toBe(code);
                    expect(error.context?.paramName).toBe('testParam');
                    expect(error.context?.functionName).toBe('testFunction');
                }
            });
        });
        describe('createErrorParams', () => {
            it('should create error params with context options', () => {
                const context = createAssetErrorContext({
                    paramName: 'testParam',
                    functionName: 'testFunction',
                });

                const params = context.createErrorParams({ value: 'test' });
                expect(params.paramName).toBe('testParam');
                expect(params.functionName).toBe('testFunction');
                expect(params.value).toBe('test');
            });

            it('should create error params without context options', () => {
                const context = createAssetErrorContext();
                const params = context.createErrorParams({ min: 1 });
                expect(params.min).toBe(1);
            });
            it('should create error params with context options', () => {
                const context = createAssetErrorContext({
                    paramName: 'testParam',
                    functionName: 'testFunction',
                });

                const params = context.createErrorParams({ value: 'test' });
                expect(params.paramName).toBe('testParam');
                expect(params.functionName).toBe('testFunction');
                expect(params.value).toBe('test');
            });

            it('should create error params without context options', () => {
                const context = createAssetErrorContext();
                const params = context.createErrorParams({ min: 1 });
                expect(params.min).toBe(1);
            });

            // 添加以下测试用例来覆盖缺失的分支
            it('should create error params with no arguments', () => {
                const context = createAssetErrorContext({
                    paramName: 'testParam',
                    functionName: 'testFunction',
                });

                // 测试调用 createErrorParams 时不传参数的情况
                const params = context.createErrorParams();
                expect(params.paramName).toBe('testParam');
                expect(params.functionName).toBe('testFunction');
                expect(Object.keys(params).length).toBe(2); // 只应包含 paramName 和 functionName
            });

            it('should create error params with no arguments and no context options', () => {
                const context = createAssetErrorContext();

                // 测试在无上下文选项的情况下调用 createErrorParams 且不传参数
                const params = context.createErrorParams();
                expect(params).toEqual({}); // 应返回空对象
            });
        });
    });

    describe('getLength', () => {
        it('should return length of string', () => {
            expect(getLength('hello')).toBe(5);
        });

        it('should return length of array', () => {
            expect(getLength([1, 2, 3])).toBe(3);
        });

        it('should return size of Set', () => {
            expect(getLength(new Set([1, 2, 3]))).toBe(3);
        });

        it('should return size of Map', () => {
            expect(
                getLength(
                    new Map([
                        ['a', 1],
                        ['b', 2],
                    ])
                )
            ).toBe(2);
        });

        it('should return number of keys in object', () => {
            expect(getLength({ a: 1, b: 2, c: 3 })).toBe(3);
        });

        it('should return undefined for non-sized values', () => {
            expect(getLength(123)).toBeUndefined();
            expect(getLength(true)).toBeUndefined();
            expect(getLength(null)).toBeUndefined();
            expect(getLength(undefined)).toBeUndefined();
        });
    });

    describe('isValidCollection', () => {
        it('should return true for arrays', () => {
            expect(isValidCollection([1, 2, 3])).toBe(true);
        });

        it('should return true for Sets', () => {
            expect(isValidCollection(new Set([1, 2, 3]))).toBe(true);
        });

        it('should return true for objects', () => {
            expect(isValidCollection({ a: 1, b: 2 })).toBe(true);
        });

        it('should return false for primitives', () => {
            expect(isValidCollection('string')).toBe(false);
            expect(isValidCollection(123)).toBe(false);
            expect(isValidCollection(true)).toBe(false);
            expect(isValidCollection(null)).toBe(false);
            expect(isValidCollection(undefined)).toBe(false);
        });
    });

    describe('getCollectionText', () => {
        it('should format arrays correctly', () => {
            expect(getCollectionText([1, 2, 3])).toBe('[1, 2, 3]');
        });

        it('should format Sets correctly', () => {
            expect(getCollectionText(new Set([1, 2, 3]))).toBe('Set(1, 2, 3)');
        });

        it('should format objects correctly', () => {
            expect(getCollectionText({ a: 1, b: 2 })).toBe('{1, 2}');
        });

        it('should handle empty collections', () => {
            expect(getCollectionText([])).toBe('[]');
            expect(getCollectionText(new Set())).toBe('Set()');
            expect(getCollectionText({})).toBe('{}');
        });
    });

    describe('generateDebugMessage - specific cases', () => {
        const context = createAssetErrorContext({
            paramName: 'testField',
            functionName: 'validate',
        });

        it('should generate message for TYPE_NOT_NUMBER', () => {
            try {
                context.throwError(ValidationErrorCode.TYPE_NOT_NUMBER, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be a number in validate");
            }
        });

        it('should generate message for TYPE_NOT_BOOLEAN', () => {
            try {
                context.throwError(ValidationErrorCode.TYPE_NOT_BOOLEAN, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be a boolean in validate");
            }
        });

        it('should generate message for TYPE_NOT_ARRAY', () => {
            try {
                context.throwError(ValidationErrorCode.TYPE_NOT_ARRAY, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be an array in validate");
            }
        });

        it('should generate message for TYPE_NOT_OBJECT', () => {
            try {
                context.throwError(ValidationErrorCode.TYPE_NOT_OBJECT, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be an object in validate");
            }
        });

        it('should generate message for MAX_LENGTH', () => {
            try {
                context.throwError(ValidationErrorCode.MAX_LENGTH, { max: 10 });
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe(
                    "Parameter 'testField' must have at most 10 items in validate"
                );
            }
        });

        it('should generate message for MIN_VALUE', () => {
            try {
                context.throwError(ValidationErrorCode.MIN_VALUE, { min: 5 });
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be at least 5 in validate");
            }
        });

        it('should generate message for MAX_VALUE', () => {
            try {
                context.throwError(ValidationErrorCode.MAX_VALUE, { max: 100 });
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be at most 100 in validate");
            }
        });

        it('should generate message for NOT_IN_COLLECTION', () => {
            try {
                context.throwError(ValidationErrorCode.NOT_IN_COLLECTION, {
                    collectionText: '[A, B, C]',
                });
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe(
                    "Parameter 'testField' must be one of: [A, B, C] in validate"
                );
            }
        });

        it('should generate message for EMAIL_INVALID', () => {
            try {
                context.throwError(ValidationErrorCode.EMAIL_INVALID, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe(
                    "Parameter 'testField' must be a valid email address in validate"
                );
            }
        });

        it('should generate message for URL_INVALID', () => {
            try {
                context.throwError(ValidationErrorCode.URL_INVALID, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be a valid URL in validate");
            }
        });

        it('should generate message for PHONE_INVALID', () => {
            try {
                context.throwError(ValidationErrorCode.PHONE_INVALID, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe(
                    "Parameter 'testField' must be a valid phone number in validate"
                );
            }
        });

        it('should generate message for PATTERN_MISMATCH', () => {
            try {
                context.throwError(ValidationErrorCode.PATTERN_MISMATCH, { pattern: '/^[a-z]+$/' });
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe(
                    "Parameter 'testField' must match pattern /^[a-z]+$/ in validate"
                );
            }
        });

        it('should generate message for EMPTY', () => {
            try {
                context.throwError(ValidationErrorCode.EMPTY, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must be empty in validate");
            }
        });

        it('should generate message for NOT_EMPTY', () => {
            try {
                context.throwError(ValidationErrorCode.NOT_EMPTY, {});
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error.message).toBe("Parameter 'testField' must not be empty in validate");
            }
        });
    });

    describe('generateDebugMessage - default case', () => {
        it('should handle unknown error codes with default message', () => {
            const context = createAssetErrorContext({
                paramName: 'testParam',
                functionName: 'testFunction',
            });

            // 创建一个不在枚举中的错误代码来测试 default 分支
            const unknownCode = 'UNKNOWN_ERROR_CODE' as ValidationErrorCode;
            const params = { value: 'test' };

            try {
                context.throwError(unknownCode, params);
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error).toBeInstanceOf(InvalidInputError);
                // 验证错误消息是否符合默认格式
                expect(error.message).toBe(
                    "Parameter 'testParam' failed validation (UNKNOWN_ERROR_CODE) in testFunction"
                );
            }
        });

        it('should handle unknown error codes with default message without context', () => {
            const context = createAssetErrorContext();
            const unknownCode = 'UNKNOWN_ERROR_CODE' as ValidationErrorCode;
            const params = { value: 'test' };

            try {
                context.throwError(unknownCode, params);
                fail('Expected error to be thrown');
            } catch (error: any) {
                expect(error).toBeInstanceOf(InvalidInputError);
                // 验证错误消息是否符合默认格式
                expect(error.message).toBe('Value failed validation (UNKNOWN_ERROR_CODE)');
            }
        });
    });

    describe('getCollectionText', () => {
        it('should convert primitive values to string using String()', () => {
            expect(getCollectionText('hello' as any)).toBe('hello');
            expect(getCollectionText(123 as any)).toBe('123');
            expect(getCollectionText(true as any)).toBe('true');
            expect(getCollectionText(false as any)).toBe('false');
            expect(getCollectionText(null as any)).toBe('null');
            expect(getCollectionText(undefined as any)).toBe('undefined');
        });

        it('should fall back to String() for non-standard objects', () => {
            // 测试那些不是数组、Set或普通对象的值
            const func = function () {};
            expect(getCollectionText(func as any)).toBe(String(func));

            // 测试RegExp - 实际上会进入对象分支，不是String分支
            const regex = /test/g;
            expect(getCollectionText(regex as any)).toBe('{}'); // RegExp没有可枚举的值

            // 测试Date - 实际上会进入对象分支，不是String分支
            const date = new Date('2023-01-01T00:00:00Z');
            // Date对象没有可枚举的自有属性，所以结果是 '{}'
            expect(getCollectionText(date as any)).toBe('{}');
        });

        it('should convert truly non-object values to string', () => {
            // 只有真正的非对象值才会进入 String(collection) 分支
            expect(getCollectionText(Symbol('test') as any)).toBe('Symbol(test)');
        });
    });
});
