// rules/constraints/membership.ts
import { ValidationErrorCode } from '../core/constants';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../core';

/**
 * 检查集合成员关系的通用函数
 */
function checkCollectionMembership(
    collection: any[] | Set<any>,
    value: any,
    shouldBeIn: boolean,
    errorCode: ValidationErrorCode
): ValidationResult {
    let isIn = false;

    if (Array.isArray(collection)) {
        isIn = collection.includes(value);
    } else if (collection instanceof Set) {
        isIn = collection.has(value);
    } else {
        return createValidationFailure(ValidationErrorCode.INVALID_COLLECTION_TYPE, {
            value,
            collection,
        });
    }

    // 根据shouldBeIn参数决定何时返回成功
    if (shouldBeIn ? isIn : !isIn) {
        return createValidationSuccess();
    }

    // 返回相应的错误
    return createValidationFailure(errorCode, {
        collection: Array.isArray(collection) ? collection : Array.from(collection),
        collectionText: Array.isArray(collection)
            ? `[${collection.join(', ')}]`
            : `{${Array.from(collection).join(', ')}}`,
        value,
    });
}

/**
 * 检查值是否在集合中
 */
export function isInCollection(collection: any[] | Set<any>): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        return checkCollectionMembership(
            collection,
            value,
            true, // 应该在集合中
            ValidationErrorCode.NOT_IN_COLLECTION
        );
    };
}

/**
 * 检查值是否不在集合中
 */
export function isNotInCollection(
    collection: any[] | Set<any>
): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        return checkCollectionMembership(
            collection,
            value,
            false, // 不应该在集合中
            ValidationErrorCode.IN_COLLECTION
        );
    };
}