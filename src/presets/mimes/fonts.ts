// @presets/fonts.ts
import { MimeTypeRegistrar } from '../../registry/registrars/MimeTypeRegistrar';

export function useFontPresets() {
    const registrar = MimeTypeRegistrar.getInstance();
    
    // Font formats
    registrar.register({
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'otf': 'font/otf',
        'eot': 'application/vnd.ms-fontobject',
        'sfnt': 'application/font-sfnt',
        'ttc': 'font/collection',
        'pfa': 'application/x-font-type1',
        'pfb': 'application/x-font-type1',
        'gsf': 'application/x-font-ghostscript',
        'pcf': 'application/x-font-pcf',
        'pcf.Z': 'application/x-font-pcf',
        'pfr': 'application/font-tdpfr',
        'fnt': 'application/octet-stream',
        'fon': 'application/octet-stream',
        'ansi': 'text/plain',
        'ans': 'text/plain',
        'dfont': 'application/octet-stream'
    });
}