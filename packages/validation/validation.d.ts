import { ValidatorRegistrar } from "./core";
import { ValidatorRegistrarName } from "./types";

declare module '@orbitjs/registry' {
    interface Registrars {
        [ValidatorRegistrarName]: ValidatorRegistrar;
    }
}