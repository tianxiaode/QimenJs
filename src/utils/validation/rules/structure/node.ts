import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';

/**
 * 检查是否为 TypedArray（如 Uint8Array, Float32Array 等）
 */
export function isTypedArray(value: any): ValidationResult {
    const isValid = ArrayBuffer.isView(value) && !(value instanceof DataView);

    if (isValid) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
        value,
        expected: 'TypedArray',
        actual: typeof value,
        errorMessage: 'Value must be a TypedArray (e.g., Uint8Array, Float32Array)',
    });
}

/**
 * 检查是否为 Buffer（Node.js 环境）
 */
export function isBuffer(value: any): ValidationResult {
    const isBufferObj = typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(value);

    if (isBufferObj) {
        return createValidationSuccess();
    }

    return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
        value,
        expected: 'Buffer',
        actual: typeof value,
        errorMessage: 'Value must be a Buffer',
    });
}
