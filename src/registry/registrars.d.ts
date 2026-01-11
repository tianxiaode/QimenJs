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
        [MimeTypeRegistrarName]: typeof MimeTypeRegistrar;
        [SystemRegistrarName]: typeof SystemRegistrar;
        [PatternRegistrarName]: typeof PatternRegistrar;
        [DomainRegistrarName]: typeof DomainRegistrar;
        [HtmlTemplateRegistrarName]: typeof HtmlTemplateRegistrar;
    }
}