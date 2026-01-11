import { EntityActionRegistrar, EntityActionRegistrarName } from "./EntityActionRegistrar";
import { SchemaRegistrar, SchemaRegistrarName } from "./SchemaRegistrar";

declare module '@orbitjs/registry' {
    interface Registrars {
        [SchemaRegistrarName]:  SchemaRegistrar;
        [EntityActionRegistrarName]:  EntityActionRegistrar;
    }
}
