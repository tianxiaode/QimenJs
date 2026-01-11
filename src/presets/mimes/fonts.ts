// @presets/fonts.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useFontPresets() {
    // Font formats
    MimeTypeRegistrar.register('woff', 'font/woff');
    MimeTypeRegistrar.register('woff2', 'font/woff2');
    MimeTypeRegistrar.register('ttf', 'font/ttf');
    MimeTypeRegistrar.register('otf', 'font/otf');
    MimeTypeRegistrar.register('eot', 'application/vnd.ms-fontobject');
    MimeTypeRegistrar.register('sfnt', 'application/font-sfnt');
    MimeTypeRegistrar.register('ttc', 'font/collection');
    MimeTypeRegistrar.register('pfa', 'application/x-font-type1');
    MimeTypeRegistrar.register('pfb', 'application/x-font-type1');
    MimeTypeRegistrar.register('gsf', 'application/x-font-ghostscript');
    MimeTypeRegistrar.register('pcf', 'application/x-font-pcf');
    MimeTypeRegistrar.register('pcf.Z', 'application/x-font-pcf');
    MimeTypeRegistrar.register('pfr', 'application/font-tdpfr');
    MimeTypeRegistrar.register('fnt', 'application/octet-stream');
    MimeTypeRegistrar.register('fon', 'application/octet-stream');
    MimeTypeRegistrar.register('ansi', 'text/plain');
    MimeTypeRegistrar.register('ans', 'text/plain');
    MimeTypeRegistrar.register('dfont', 'application/octet-stream');
}