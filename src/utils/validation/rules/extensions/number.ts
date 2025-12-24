import { NumberRuleOptions } from '../core';

export interface NumberRequiredRuleOptions extends Omit<
    NumberRuleOptions,
    'required' | 'nullable' | 'empty'
> {}

export interface NumberExtensionRule extends NumberRequiredRuleOptions {
    positive?: boolean;
    negative?: boolean;
    odd?: boolean;
    even?: boolean;
    finite?: boolean;
    infinite?: boolean;

    allowsValues?: readonly number[];
    disallowsValues?: readonly number[];
}
