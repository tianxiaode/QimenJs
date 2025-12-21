import { ExtensionRule, HasPropertiesRule } from '../../core';
import { ObjectRuleOptions } from '../core';

export interface ObjectAdvanceRule extends ExtensionRule, Omit<ObjectRuleOptions,'type'> {
    type: 'objectEx';
}
