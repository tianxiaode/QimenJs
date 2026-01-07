import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler, ValidationWeight } from '../../types';

// 定义对象is验证的谓词函数类型
type ObjectIsPredicate = (value: any) => { isValid: boolean; expectedType: string };

// 对象is验证谓词映射对象 - 只定义需要验证的类型
const objectIsPredicates: Record<string, ObjectIsPredicate> = {
    // 验证是否为文件对象
    file: (value: any) => {
        const isValid =
            value instanceof File ||
            (typeof value === 'object' &&
                value !== null &&
                typeof value.name === 'string' &&
                typeof value.size === 'number' &&
                typeof value.type === 'string' &&
                typeof value.lastModified === 'number');
        return {
            isValid,
            expectedType: 'File object',
        };
    },

    // 验证是否为图片对象
    image: (value: any) => {
        const isValid =
            value instanceof HTMLImageElement ||
            (typeof value === 'object' &&
                value !== null &&
                typeof value.src === 'string' &&
                (typeof value.width === 'number' || typeof value.height === 'number')) ||
            (value instanceof File && value.type.startsWith('image/'));
        return {
            isValid,
            expectedType: 'Image object',
        };
    },

    // 验证是否为blob对象
    blob: (value: any) => {
        const isValid =
            value instanceof Blob ||
            (typeof value === 'object' &&
                value !== null &&
                typeof value.size === 'number' &&
                typeof value.type === 'string' &&
                typeof value.arrayBuffer === 'function');
        return {
            isValid,
            expectedType: 'Blob object',
        };
    },

    // 验证是否为buffer对象
    buffer: (value: any) => {
        // 检查是否为Node.js Buffer
        const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(value);

        // 或者检查是否为ArrayBuffer或TypedArray
        const isArrayBufferView = ArrayBuffer.isView && ArrayBuffer.isView(value);

        const isTypedArray =
            value instanceof Int8Array ||
            value instanceof Uint8Array ||
            value instanceof Uint8ClampedArray ||
            value instanceof Int16Array ||
            value instanceof Uint16Array ||
            value instanceof Int32Array ||
            value instanceof Uint32Array ||
            value instanceof Float32Array ||
            value instanceof Float64Array;

        const isValid = isBuffer || isArrayBufferView || isTypedArray;
        return {
            isValid,
            expectedType: 'Buffer object',
        };
    },
};

export const ObjectIsProcessor: ValidationProcessorHandler = async context => {
    const { value, rule, path } = context;

    // 如果没有is规则，跳过处理
    if (!rule.is) return;

    // 检查是否为对象类型（但排除null和数组）
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        // 如果是尝试验证file、image、blob、buffer，但值不是对象，跳过处理
        if (['file', 'image', 'blob', 'buffer'].includes(rule.is)) {
            return;
        }
    }

    // 获取对应的验证函数
    const validator = objectIsPredicates[rule.is];

    if (!validator) {
        // 如果没有找到对应的验证器，跳过处理
        return;
    }

    // 执行验证
    const { isValid, expectedType } = validator(value);

    if (!isValid) {
        context.errors.push(
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: expectedType,
            })
        );
        context.terminate = true;
        return;
    }

    // 验证通过后，继续检查min和max约束
    if (rule.min !== undefined || rule.max !== undefined) {
        // 对于file/blob类型，我们检查大小
        let size = 0;

        if (value instanceof File || value instanceof Blob) {
            size = value.size;
        } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(value)) {
            size = value.length;
        } else if (ArrayBuffer.isView(value)) {
            size = value.byteLength;
        }

        // 检查最小值
        if (rule.min !== undefined && size < rule.min) {
            context.errors.push(
                ValidationErrorBuilder.too_small(rule.min, value, false, {
                    ...context,
                    expected: `minimum size of ${rule.min}`,
                    actual: size,
                })
            );
        }

        // 检查最大值
        if (rule.max !== undefined && size > rule.max) {
            context.errors.push(
                ValidationErrorBuilder.too_large(rule.max, value, false, {
                    ...context,
                    expected: `maximum size of ${rule.max}`,
                    actual: size,
                })
            );
        }
    }

    context.terminate = true;
};

ValidationRegistry.register({
    name: 'object.is',
    tags: ['object'],
    weight: ValidationWeight.SEMANTIC,
    offset: 10,
    execute: ObjectIsProcessor,
});
