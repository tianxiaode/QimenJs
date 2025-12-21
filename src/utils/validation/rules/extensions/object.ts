import { ObjectRuleOptions } from '../core';

export interface ObjectExtensionRule extends ObjectRuleOptions, Omit<ObjectRuleOptions,'type'> {
}
