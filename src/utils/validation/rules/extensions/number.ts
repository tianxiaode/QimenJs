import { ExtensionRule } from '../../core';
import { NumberRule } from '../core';

export interface NumberAdvanceRule extends ExtensionRule, Omit<NumberRule, 'type'> {
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

