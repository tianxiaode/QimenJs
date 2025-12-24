import { ObjectRuleOptions } from '../core';

export interface ObjectRequiredRuleOptions extends Omit<
    ObjectRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

export interface ObjectKeysRuleOptions extends ObjectRequiredRuleOptions {
    keys: string | string[];
    allErrors: boolean;
}
