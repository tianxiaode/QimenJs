import { RegistryHub } from '@orbitjs/registry';
import { SchemaRegistrar } from './registrars/SchemaRegistrar';
import { EntityActionRegistrar } from './registrars/EntityActionRegistrar';

export * from './events';
export * from './core';
export * from './actions';
export * from './types';
export * from './events';

RegistryHub.use(SchemaRegistrar.getInstance());
RegistryHub.use(EntityActionRegistrar.getInstance());