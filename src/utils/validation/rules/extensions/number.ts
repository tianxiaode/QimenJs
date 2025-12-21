import { ExtensionRule } from '../../core';
import { NumberRuleOptions } from '../core';

export interface NumberAdvanceRule extends ExtensionRule, Omit<NumberRuleOptions, 'type'> {
    type: 'numberEx';
    positive?: boolean;
    negative?: boolean;
    odd?: boolean;
    even?: boolean;
    finite?: boolean;
    infinite?: boolean;

    allowsValues?: readonly number[];
    disallowsValues?: readonly number[];
}

