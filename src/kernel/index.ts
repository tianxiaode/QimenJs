import { RegistryHub } from '@orbitjs/registry';
import { SchemaRegistrar } from './registrars/SchemaRegistrar';
import { EntityActionRegistrar } from './registrars/EntityActionRegistrar';

export * from './events';
export * from './flow';
export * from './http';
export * from './processors';
export * from './types';

RegistryHub.use(SchemaRegistrar.getInstance());
RegistryHub.use(EntityActionRegistrar.getInstance());