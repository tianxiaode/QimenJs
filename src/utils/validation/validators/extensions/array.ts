import { ValidationRuleError } from '../../core';
import { ArrayAdvanceRule } from '../../rules';
import { validate } from '../../validate';
import { ValidationErrorBuilder } from '../../core';

export function validateArrayAdvance(
    value: any,
    rule: ArrayAdvanceRule,
    context?: any
): ValidationRuleError[] | null {
    // ---------- 1️⃣ 类型校验 ----------
    if (!Array.isArray(value)) {
        return [ValidationErrorBuilder.type_mismatch('array', typeof value, context)];
    }

    const errors: ValidationRuleError[] = [];
    const length = value.length;

    // ---------- 2️⃣ 空数组 ----------
    if (rule.allowEmpty === false && length === 0) {
        errors.push(
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: 'non-empty array',
            })
        );
        return errors;
    }

    // ---------- 3️⃣ 长度校验 ----------
    if (rule.length !== undefined && length !== rule.length) {
        errors.push(
            ValidationErrorBuilder.invalid_value(value, {
                ...context,
                expected: `length === ${rule.length}`,
                actual: length,
            })
        );
    }

    if (rule.minLength !== undefined && length < rule.minLength) {
        errors.push(ValidationErrorBuilder.too_small(rule.minLength, length, false, context));
    }

    if (rule.maxLength !== undefined && length > rule.maxLength) {
        errors.push(ValidationErrorBuilder.too_large(rule.maxLength, length, false, context));
    }

    if (errors.length) return errors;

    // ---------- 4️⃣ items 校验 ----------
    if (rule.items) {
        // tuple
        if (Array.isArray(rule.items)) {
            for (let i = 0; i < rule.items.length; i++) {
                const itemRule = rule.items[i];
                const itemErrors = validate.any(value[i], itemRule, {
                    ...context,
                    path: `${context?.path ?? ''}[${i}]`,
                });
                if (itemErrors) return itemErrors;
            }
        }

        // uniform
        else {
            for (let i = 0; i < value.length; i++) {
                const itemErrors = validate.any(value[i], rule.items, {
                    ...context,
                    path: `${context?.path ?? ''}[${i}]`,
                });
                if (itemErrors) return itemErrors;
            }
        }
    }

    // ---------- 5️⃣ unique ----------
    if (rule.unique) {
        const set = new Set();
        for (const item of value) {
            if (set.has(item)) {
                return [ValidationErrorBuilder.duplicate('array', item, context)];
            }
            set.add(item);
        }
    }

    // ---------- 6️⃣ uniqueBy ----------
    if (rule.uniqueBy) {
        const set = new Set();
        const getter =
            typeof rule.uniqueBy === 'function'
                ? rule.uniqueBy
                : (item: any) => item?.[rule.uniqueBy as string];

        for (const item of value) {
            const key = getter(item);
            if (set.has(key)) {
                return [ValidationErrorBuilder.duplicate('array', key, context)];
            }
            set.add(key);
        }
    }

    // ---------- 7️⃣ contains ----------
    if (rule.contains) {
        const count = rule.contains.filter(v => value.includes(v)).length;

        if (rule.minContains !== undefined && count < rule.minContains) {
            return [
                ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: `contains at least ${rule.minContains}`,
                    actual: count,
                }),
            ];
        }

        if (rule.maxContains !== undefined && count > rule.maxContains) {
            return [
                ValidationErrorBuilder.invalid_value(value, {
                    ...context,
                    expected: `contains at most ${rule.maxContains}`,
                    actual: count,
                }),
            ];
        }
    }

    // ---------- 8️⃣ some / every / none ----------
    if (rule.some) {
        const ok = value.some(v => !validate.any(v, rule.some));
        if (!ok) {
            return [ValidationErrorBuilder.condition_failed('array', 'some', value, context)];
        }
    }

    if (rule.every) {
        const ok = value.every(v => !validate.any(v, rule.every));
        if (!ok) {
            return [ValidationErrorBuilder.condition_failed('array', 'every', value, context)];
        }
    }

    if (rule.none) {
        const ok = value.every(v => validate.any(v, rule.none));
        if (!ok) {
            return [ValidationErrorBuilder.condition_failed('array', 'none', value, context)];
        }
    }

    // ---------- 9️⃣ sorted ----------
    if (rule.sorted) {
        const compare =
            typeof rule.sorted === 'function'
                ? rule.sorted
                : (a: any, b: any) => (rule.sorted === 'asc' ? (a > b ? 1 : -1) : a < b ? 1 : -1);

        for (let i = 1; i < value.length; i++) {
            if (compare(value[i - 1], value[i]) > 0) {
                return [
                    ValidationErrorBuilder.invalid_value(value, {
                        ...context,
                        expected: 'sorted array',
                    }),
                ];
            }
        }
    }

    return null;
}
