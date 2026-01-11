import {
    DomainRegistrar,
    MimeTypeRegistrar,
    PatternRegistrar,
    SystemRegistrar,
    HtmlTemplateRegistrar
} from './registrars';
import { 
    SystemRegistrarName, 
    PatternRegistrarName, 
    MimeTypeRegistrarName,
    DomainRegistrarName, 
    HtmlTemplateRegistrarName 
} from './types';

declare module '@orbitjs/registry' {
    interface Registrars {
        [MimeTypeRegistrarName]: MimeTypeRegistrar;
        [SystemRegistrarName]: SystemRegistrar;
        [PatternRegistrarName]: PatternRegistrar;
        [DomainRegistrarName]: DomainRegistrar;
        [HtmlTemplateRegistrarName]: HtmlTemplateRegistrar;
    }
}