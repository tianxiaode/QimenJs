import { CompareRuleOptions, ContainsRuleOptions } from '../common';

export interface CompareOperatorRuleOptions extends Omit<CompareRuleOptions, 'operator'> {}

export interface ContainsExtensionRuleOptions extends ContainsRuleOptions {
    minContains?: number;
    maxContains?: number;
}

