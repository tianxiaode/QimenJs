import { EntityActionRegistrar, EntityActionRegistrarName, SchemaRegistrar, SchemaRegistrarName } from "./registrars";
import { IEventContext } from "./types";

declare module '@orbitjs/registry' {
    interface Registrars {
        [EntityActionRegistrarName]: EntityActionRegistrar;
        [SchemaRegistrarName]: SchemaRegistrar;
        [ComposableRegistrarName]: ComposableRegistrar;
    }
}
