import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler, ValidationWeight } from '../../types';

// 定义日期is验证的谓词函数类型
type DateIsPredicate = (value: Date) => { isValid: boolean; expectedType: string };

// 日期is验证谓词映射对象 - 只定义需要验证的类型
const dateIsPredicates: Record<string, DateIsPredicate> = {
    // 验证是否为将来日期
    future: (value: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            isValid: value.getTime() > today.getTime(),
            expectedType: 'future date'
        };
    },
    
    // 验证是否为过去日期
    past: (value: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            isValid: value.getTime() < today.getTime(),
            expectedType: 'past date'
        };
    },
    
    // 验证是否为今天
    today: (value: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const valueDate = new Date(value);
        valueDate.setHours(0, 0, 0, 0);
        
        return {
            isValid: valueDate.getTime() === today.getTime(),
            expectedType: 'today\'s date'
        };
    },
    
    // 验证是否为昨天
    yesterday: (value: Date) => {
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const valueYesterday = new Date(value);
        valueYesterday.setHours(0, 0, 0, 0);
        
        return {
            isValid: valueYesterday.getTime() === yesterday.getTime(),
            expectedType: 'yesterday\'s date'
        };
    },
    
    // 验证是否为明天
    tomorrow: (value: Date) => {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const valueTomorrow = new Date(value);
        valueTomorrow.setHours(0, 0, 0, 0);
        
        return {
            isValid: valueTomorrow.getTime() === tomorrow.getTime(),
            expectedType: 'tomorrow\'s date'
        };
    },
};

export const DateIsProcessor: ValidationProcessorHandler = async (context) => {
    const { value, rule, path } = context;

    // 如果值不是日期或没有is规则，跳过处理
    if (!(value instanceof Date) || !rule.is) return;

    // 首先验证日期是否有效
    if (isNaN(value.getTime())) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: 'valid Date object'
        }));
        return;
    }

    // 如果没有对应的验证器，说明不需要验证此类型，直接跳过
    const validator = dateIsPredicates[rule.is];
    if (!validator) {
        return;
    }

    // 执行验证
    const { isValid, expectedType } = validator(value);

    if (!isValid) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: expectedType
        }));
    }
};

ValidationRegistry.register({
    name: 'date.is',
    tags: ['date'],
    weight: ValidationWeight.SEMANTIC,
    offset: 10,
    execute: DateIsProcessor,
});