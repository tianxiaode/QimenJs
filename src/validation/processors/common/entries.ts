import { RefreshContextStatusProcessor } from './context';
import { RuleAlignmentProcessor } from './rule-align';
import { TransformProcessor } from './transform';
import { TrimProcessor } from './trim';
import { PresenceProcessor } from './presence';

import { ValidationWeight, allValidateTypes } from '../../types';

/** 规则对齐验证处理器注册条目 */
export const ruleAlignmentProcessorEntry = {
    name: 'common-rule-align',
    tags: allValidateTypes,
    weight: ValidationWeight.PREPARATION,
    offset: 0,
    execute: RuleAlignmentProcessor,
};

/** 值转换验证处理器注册条目 */
export const transformProcessorEntry = {
    name: 'common-transform',
    tags: allValidateTypes,
    weight: ValidationWeight.PREPARATION,
    offset: 10,
    execute: TransformProcessor,
};

/** 去空格验证处理器注册条目 */
export const trimProcessorEntry = {
    name: 'Trim',
    tags: allValidateTypes,
    weight: ValidationWeight.PREPARATION,
    offset: 20,
    execute: TrimProcessor,
};

/** 上下文状态刷新验证处理器注册条目 */
export const refreshContextStatusProcessorEntry = {
    name: 'common-refrence-context-status',
    tags: allValidateTypes,
    weight: ValidationWeight.PREPARATION,
    offset: 30,
    execute: RefreshContextStatusProcessor,
};

/** 存在性检查验证处理器注册条目 */
export const presenceProcessorEntry = {
    name: 'common-presence',
    tags: allValidateTypes,
    weight: ValidationWeight.PRESENCE,
    offset: 100,
    execute: PresenceProcessor,
};
