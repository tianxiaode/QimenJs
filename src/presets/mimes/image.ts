// @presets/image.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useImagePresets() {
    MimeTypeRegistrar.register('jpg', ['image/jpeg', 'image/pjpeg']);
    MimeTypeRegistrar.register('jpeg', ['image/jpeg', 'image/pjpeg']);
    MimeTypeRegistrar.register('png', 'image/png');
    MimeTypeRegistrar.register('webp', 'image/webp');
    MimeTypeRegistrar.register('gif', 'image/gif');
    MimeTypeRegistrar.register('bmp', 'image/bmp');
    MimeTypeRegistrar.register('ico', ['image/x-icon', 'image/vnd.microsoft.icon']);
    MimeTypeRegistrar.register('svg', 'image/svg+xml');
    MimeTypeRegistrar.register('tiff', ['image/tiff', 'image/tif']);
    MimeTypeRegistrar.register('tif', ['image/tiff', 'image/tif']);
    MimeTypeRegistrar.register('avif', 'image/avif');
    MimeTypeRegistrar.register('apng', 'image/apng');
    MimeTypeRegistrar.register('jfif', 'image/jfif');
    MimeTypeRegistrar.register('pjpeg', 'image/pjpeg');
    MimeTypeRegistrar.register('pjp', 'image/pjpeg');
    MimeTypeRegistrar.register('xbm', 'image/x-xbitmap');
    MimeTypeRegistrar.register('dib', 'image/bmp');
    MimeTypeRegistrar.register('svgz', 'image/svg+xml');
    MimeTypeRegistrar.register('dds', 'image/vnd.ms-dds');
    
    // registeritional image formats
    MimeTypeRegistrar.register('cur', 'image/x-icon');
    MimeTypeRegistrar.register('eps', 'image/eps');
    MimeTypeRegistrar.register('exr', 'image/x-exr');
    MimeTypeRegistrar.register('hdr', 'image/vnd.radiance');
    MimeTypeRegistrar.register('heic', 'image/heic');
    MimeTypeRegistrar.register('heif', 'image/heif');
    MimeTypeRegistrar.register('j2k', 'image/jp2');
    MimeTypeRegistrar.register('jfi', 'image/jpeg');
    MimeTypeRegistrar.register('jif', 'image/jpeg');
    MimeTypeRegistrar.register('jpe', 'image/jpeg');
    MimeTypeRegistrar.register('jxr', 'image/jxr');
    MimeTypeRegistrar.register('pbm', 'image/x-portable-bitmap');
    MimeTypeRegistrar.register('pgm', 'image/x-portable-graymap');
    MimeTypeRegistrar.register('pic', 'image/x-pict');
    MimeTypeRegistrar.register('pnm', 'image/x-portable-anymap');
    MimeTypeRegistrar.register('ppm', 'image/x-portable-pixmap');
    MimeTypeRegistrar.register('psd', 'image/vnd.adobe.photoshop');
    MimeTypeRegistrar.register('sgi', 'image/sgi');
    MimeTypeRegistrar.register('sun', 'image/x-sun-raster');
    MimeTypeRegistrar.register('wbmp', 'image/vnd.wap.wbmp');
    MimeTypeRegistrar.register('xcf', 'image/x-xcf');
    MimeTypeRegistrar.register('xpm', 'image/x-xpixmap');
}