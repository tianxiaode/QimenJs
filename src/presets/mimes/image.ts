// @presets/image.ts
import { MimeTypeRegistrar } from '../../registry/registrars/MimeTypeRegistrar';

export function useImagePresets() {
    const registrar = MimeTypeRegistrar.getInstance();
    
    registrar.register({
        'jpg': ['image/jpeg', 'image/pjpeg'],
        'jpeg': ['image/jpeg', 'image/pjpeg'],
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'ico': ['image/x-icon', 'image/vnd.microsoft.icon'],
        'svg': 'image/svg+xml',
        'tiff': ['image/tiff', 'image/tif'],
        'tif': ['image/tiff', 'image/tif'],
        'avif': 'image/avif',
        'apng': 'image/apng',
        'jfif': 'image/jfif',
        'pjpeg': 'image/pjpeg',
        'pjp': 'image/pjpeg',
        'xbm': 'image/x-xbitmap',
        'dib': 'image/bmp',
        'svgz': 'image/svg+xml',
        'dds': 'image/vnd.ms-dds',
        
        // registeritional image formats
        'cur': 'image/x-icon',
        'eps': 'image/eps',
        'exr': 'image/x-exr',
        'hdr': 'image/vnd.radiance',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'j2k': 'image/jp2',
        'jfi': 'image/jpeg',
        'jif': 'image/jpeg',
        'jpe': 'image/jpeg',
        'jxr': 'image/jxr',
        'pbm': 'image/x-portable-bitmap',
        'pgm': 'image/x-portable-graymap',
        'pic': 'image/x-pict',
        'pnm': 'image/x-portable-anymap',
        'ppm': 'image/x-portable-pixmap',
        'psd': 'image/vnd.adobe.photoshop',
        'sgi': 'image/sgi',
        'sun': 'image/x-sun-raster',
        'wbmp': 'image/vnd.wap.wbmp',
        'xcf': 'image/x-xcf',
        'xpm': 'image/x-xpixmap'
    });
}