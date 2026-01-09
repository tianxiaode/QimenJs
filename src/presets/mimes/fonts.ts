// @presets/fonts.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useFontPresets() {
    // Font formats
    MimeTypeRegistrar.add('woff', 'font/woff');
    MimeTypeRegistrar.add('woff2', 'font/woff2');
    MimeTypeRegistrar.add('ttf', 'font/ttf');
    MimeTypeRegistrar.add('otf', 'font/otf');
    MimeTypeRegistrar.add('eot', 'application/vnd.ms-fontobject');
    MimeTypeRegistrar.add('sfnt', 'application/font-sfnt');
    MimeTypeRegistrar.add('ttc', 'font/collection');
    MimeTypeRegistrar.add('pfa', 'application/x-font-type1');
    MimeTypeRegistrar.add('pfb', 'application/x-font-type1');
    MimeTypeRegistrar.add('gsf', 'application/x-font-ghostscript');
    MimeTypeRegistrar.add('pcf', 'application/x-font-pcf');
    MimeTypeRegistrar.add('pcf.Z', 'application/x-font-pcf');
    MimeTypeRegistrar.add('pfr', 'application/font-tdpfr');
    MimeTypeRegistrar.add('fnt', 'application/octet-stream');
    MimeTypeRegistrar.add('fon', 'application/octet-stream');
    MimeTypeRegistrar.add('ansi', 'text/plain');
    MimeTypeRegistrar.add('ans', 'text/plain');
    MimeTypeRegistrar.add('dfont', 'application/octet-stream');
}