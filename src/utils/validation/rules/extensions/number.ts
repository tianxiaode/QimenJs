import { NumberRuleOptions } from '../core';

export interface NumberExtensionRule extends NumberRuleOptions {
    positive?: boolean;
    negative?: boolean;
    odd?: boolean;
    even?: boolean;
    finite?: boolean;
    infinite?: boolean;

    allowsValues?: readonly number[];
    disallowsValues?: readonly number[];
}

