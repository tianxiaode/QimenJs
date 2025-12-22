import { ObjectRuleOptions } from '../core';

export interface ObjectKeysRuleOptions extends ObjectRuleOptions {
  keys: string | string[];
  allErrors: boolean;
}