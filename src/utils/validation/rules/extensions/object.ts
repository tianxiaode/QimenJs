import { ObjectRuleOptions } from '../core';

export interface ObjectKeysRuleOptions extends Omit<ObjectRuleOptions, 'required' | 'nullable' | 'empty'> {
  keys: string | string[];
  allErrors: boolean;
}