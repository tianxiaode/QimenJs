import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isDate } from '../types';

/**
 * 检查是否为有效日期
 */
export function isValidDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (!isNaN(value.getTime())) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            errorMessage: 'Value must be a valid date',
        });
    };
}

/**
 * 检查日期是否在指定范围之前
 */
export function isDateBefore(date: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        if (value < date) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_LARGE, {
            value,
            max: date,
            actual: value,
            errorMessage: `Date must be before ${date.toISOString()}`,
        });
    };
}

/**
 * 检查日期是否在指定范围之后
 */
export function isDateAfter(date: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        if (value > date) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_SMALL, {
            value,
            min: date,
            actual: value,
            errorMessage: `Date must be after ${date.toISOString()}`,
        });
    };
}

/**
 * 检查日期是否在指定范围内
 */
export function isDateBetween(startDate: Date, endDate: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        if (value >= startDate && value <= endDate) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.OUT_OF_RANGE, {
            value,
            min: startDate,
            max: endDate,
            actual: value,
            errorMessage: `Date must be between ${startDate.toISOString()} and ${endDate.toISOString()}`,
        });
    };
}

/**
 * 检查是否为特定日期
 */
export function isExactDate(expectedDate: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        // 比较日期部分，忽略时间部分
        const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const expectedDateOnly = new Date(
            expectedDate.getFullYear(),
            expectedDate.getMonth(),
            expectedDate.getDate()
        );

        if (valueDate.getTime() === expectedDateOnly.getTime()) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            expected: expectedDateOnly,
            actual: valueDate,
            errorMessage: `Date must be exactly ${expectedDateOnly.toDateString()}`,
        });
    };
}

/**
 * 检查日期是否为今天
 */
export function isToday(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        const today = new Date();
        const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (valueDate.getTime() === todayDate.getTime()) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
            value,
            errorMessage: 'Date must be today',
        });
    };
}

/**
 * 检查日期是否在过去
 */
export function isPastDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        const now = new Date();

        if (value < now) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_LARGE, {
            value,
            max: now,
            actual: value,
            errorMessage: 'Date must be in the past',
        });
    };
}

/**
 * 检查日期是否在未来
 */
export function isFutureDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        const now = new Date();

        if (value > now) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.TOO_SMALL, {
            value,
            min: now,
            actual: value,
            errorMessage: 'Date must be in the future',
        });
    };
}

/**
 * 检查日期是否为指定的星期几
 * @param weekdays 允许的星期几 (0-6, 周日-周六) 或其数组
 */
export function isWeekday(weekdays: number | number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_MISMATCH, {
                value,
                expected: 'Date',
                actual: typeof value,
                errorMessage: 'Value must be a Date object',
            });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_VALUE, {
                value,
                errorMessage: 'Value must be a valid date',
            });
        }

        const day = value.getDay(); // 0-6 (周日-周六)
        const allowedWeekdays = Array.isArray(weekdays) ? weekdays : [weekdays];

        if (allowedWeekdays.includes(day)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_ALLOWED, {
            value,
            day,
            allowedValues: allowedWeekdays,
            errorMessage: `Date must be on one of the allowed weekdays: ${allowedWeekdays.join(', ')}`,
        });
    };
}
