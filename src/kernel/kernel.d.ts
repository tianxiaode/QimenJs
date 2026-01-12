import { EntityActionRegistrar, EntityActionRegistrarName, SchemaRegistrar, SchemaRegistrarName } from "./registrars";

declare module '@orbitjs/registry' {
    interface Registrars {
        [EntityActionRegistrarName]: EntityActionRegistrar;
        [SchemaRegistrarName]: SchemaRegistrar;
    }
}
