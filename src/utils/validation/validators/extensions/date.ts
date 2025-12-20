import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, CheckResult } from '../../core';
import { DateAdvanceRule } from '../../rules';
import { validateCompare } from '../common';
import { validateDate } from '../core';

export function validateDateAdvance(
    value: any,
    rule: DateAdvanceRule,
    context?: ValidationErrorContext
): ValidationResult {
    const error = validateDate(value, { ...rule, required: true, nullable: false }, context);
    if (error) return error;

    const date = value as Date;
    const now = new Date();

    if (rule.today) {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
        );
        return (
            validateCompare(
                date,
                {
                    operator: 'gte',
                    target: startOfToday,
                },
                context
            ) ||
            validateCompare(
                date,
                {
                    operator: 'lte',
                    target: endOfToday,
                },
                context
            )
        );
    }

    if (rule.yesterday) {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            23,
            59,
            59,
            999
        );
        return (
            validateCompare(
                date,
                {
                    operator: 'gte',
                    target: startOfYesterday,
                },
                context
            ) ||
            validateCompare(
                date,
                {
                    operator: 'lte',
                    target: endOfYesterday,
                },
                context
            )
        );
    }

    if (rule.tomorrow) {
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const endOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            23,
            59,
            59,
            999
        );
        return (
            validateCompare(
                date,
                {
                    operator: 'gte',
                    target: startOfTomorrow,
                },
                context
            ) ||
            validateCompare(
                date,
                {
                    operator: 'lte',
                    target: endOfTomorrow,
                },
                context
            )
        );
    }

    if (rule.past) {
        return validateCompare(
            date,
            {
                operator: 'lt',
                target: () => now,
            },
            context
        );
    }

    if (rule.future) {
        return validateCompare(
            date,
            {
                operator: 'gt',
                target: () => now,
            },
            context
        );
    }

    if (rule.weekend !== undefined) {
        const days = Array.isArray(rule.weekend) ? rule.weekend : [rule.weekend];

        if (!days.includes(date.getDay())) {
            return ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: 'weekend',
            });
        }
        return null;
    }

    return ValidationErrorBuilder.invalid_value(rule, {
        ...context,
        expected: 'valid date advance rule',
    });
}
