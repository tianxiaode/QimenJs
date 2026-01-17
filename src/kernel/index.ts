import { RegistryHub } from '@orbitjs/registry';
import { SchemaRegistrar } from './registrars/SchemaRegistrar';
import { EntityActionRegistrar } from './registrars/EntityActionRegistrar';

export * from './events';
export * from './core';
export * from './actions';
export * from './types';
export * from './events';

import * as AllEntries from './abilities';
import { ComposableRegistrar } from './registrars';
import { ComposableEntry } from './types';

export const bootstrapValidators = () => {
    // AllEntries 现在是一个对象，Key 是变量名，Value 是 Entry 对象
    Object.values(AllEntries).forEach((entry: ComposableEntry) => {
        // 简单的健壮性检查：确保它是一个有效的 Entry 对象
        if (entry && entry.name && entry.ctor) {
            ComposableRegistrar.getInstance().register(entry);
        }
    });
};

RegistryHub.use(SchemaRegistrar.getInstance());
RegistryHub.use(EntityActionRegistrar.getInstance());
RegistryHub.use(ComposableRegistrar.getInstance());