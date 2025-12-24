import { DateRuleOptions } from '../core';

export interface DateRequiredRuleOptions extends Omit<
    DateRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

export interface WeekendRuleOptions extends DateRequiredRuleOptions {
    weekend: number | number[];
}
