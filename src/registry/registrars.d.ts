import { MimeTypeRegistrar } from "./registrars/MimeTypeRegistrar";
import { PatternRegistrar } from "./registrars/PatternRegistrar";
import { SystemRegistrar } from "./registrars/SystemRegistrar";
import { MimeTypeRegistrarName, PatternRegistrarName, SystemRegistrarName } from "./types";

declare module '@orbitjs/registry' {
    interface Registrars {
        [MimeTypeRegistrarName]: typeof MimeTypeRegistrar;
        [SystemRegistrarName]: typeof SystemRegistrar;
        [PatternRegistrarName]: typeof PatternRegistrar;
    }
}

