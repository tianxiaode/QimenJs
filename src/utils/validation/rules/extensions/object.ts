import { ExtensionRule, HasPropertiesRule } from '../../core';
import { ObjectRule } from '../core';

export interface ObjectAdvanceRule extends ExtensionRule, Omit<ObjectRule,'type'> {
    type: 'objectAdvance';
}
