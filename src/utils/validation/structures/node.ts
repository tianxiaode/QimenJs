// rules/structures/node.ts
import { ValidationErrorCode } from '../core/constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../core';

/**
 * 检查是否为 TypedArray（如 Uint8Array, Float32Array 等）
 */
export function isTypedArray(value: any): ValidationResult {
  const isValid = ArrayBuffer.isView(value) && !(value instanceof DataView);
  
  if (isValid) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_TYPED_ARRAY, { value });
}

/**
 * 检查是否为 Buffer（Node.js 环境）
 */
export function isBuffer(value: any): ValidationResult {
  const isBufferObj = (
    typeof Buffer !== 'undefined' &&
    Buffer.isBuffer &&
    Buffer.isBuffer(value)
  );
  
  if (isBufferObj) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BUFFER, { value });
}