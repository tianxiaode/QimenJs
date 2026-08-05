//导出核心函数和错误
export * from './core';
//导出全部验证规则
export * from './types';

import * as AllEntries from './processors';
import { ValidatorRegistrar } from './core';
import { RegistryHub } from '@qimenjs/registry';

/** 引导注册所有内置验证处理器 */
export const bootstrapValidators = () => {
    // AllEntries 现在是一个对象，Key 是变量名，Value 是 Entry 对象
    Object.values(AllEntries).forEach((entry: any) => {
        // 简单的健壮性检查：确保它是一个有效的 Entry 对象
        if (entry && entry.name && entry.execute) {
            ValidatorRegistrar.getInstance().register(entry);
        }
    });
};

export * from './errors';
export * from './engine';

RegistryHub.use(ValidatorRegistrar.getInstance());
