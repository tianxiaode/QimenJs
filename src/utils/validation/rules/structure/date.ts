import { ValidationErrorCode } from '../../core';
import { ValidationResult, createValidationFailure, createValidationSuccess } from '../../core';
import { isDate } from '../types';

/**
 * 检查是否为有效日期
 */
export function isValidDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (!isNaN(value.getTime())) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
    };
}

/**
 * 检查日期是否在指定范围之前
 */
export function isDateBefore(date: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        if (value < date) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.DATE_NOT_BEFORE, {
            value,
            comparisonDate: date,
        });
    };
}

/**
 * 检查日期是否在指定范围之后
 */
export function isDateAfter(date: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        if (value > date) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.DATE_NOT_AFTER, {
            value,
            comparisonDate: date,
        });
    };
}

/**
 * 检查日期是否在指定范围内
 */
export function isDateBetween(startDate: Date, endDate: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        if (value >= startDate && value <= endDate) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.DATE_NOT_BETWEEN, {
            value,
            startDate,
            endDate,
        });
    };
}

/**
 * 检查是否为特定日期
 */
export function isExactDate(expectedDate: Date): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
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

        return createValidationFailure(ValidationErrorCode.DATE_MISMATCH, {
            value,
            expectedDate,
        });
    };
}

/**
 * 检查日期是否为今天
 */
export function isToday(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        const today = new Date();
        const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (valueDate.getTime() === todayDate.getTime()) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_TODAY, { value });
    };
}

/**
 * 检查日期是否在过去
 */
export function isPastDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        const now = new Date();

        if (value < now) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_PAST_DATE, { value });
    };
}

/**
 * 检查日期是否在未来
 */
export function isFutureDate(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        const now = new Date();

        if (value > now) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.NOT_FUTURE_DATE, { value });
    };
}

/**
 * 检查日期是否为指定的星期几
 * @param weekdays 允许的星期几 (0-6, 周日-周六) 或其数组
 */
export function isWeekday(weekdays: number | number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        if (!isDate(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_DATE, { value });
        }

        if (isNaN(value.getTime())) {
            return createValidationFailure(ValidationErrorCode.INVALID_DATE, { value });
        }

        const day = value.getDay(); // 0-6 (周日-周六)
        const allowedWeekdays = Array.isArray(weekdays) ? weekdays : [weekdays];
        
        if (allowedWeekdays.includes(day)) {
            return createValidationSuccess();
        }

        return createValidationFailure(ValidationErrorCode.INVALID_WEEKDAY, {
            value,
            weekday: day,
            allowedWeekdays,
        });
    };
}