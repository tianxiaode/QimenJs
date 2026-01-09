// @presets/image.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useImagePresets() {
    MimeTypeRegistrar.add('jpg', ['image/jpeg', 'image/pjpeg']);
    MimeTypeRegistrar.add('jpeg', ['image/jpeg', 'image/pjpeg']);
    MimeTypeRegistrar.add('png', 'image/png');
    MimeTypeRegistrar.add('webp', 'image/webp');
    MimeTypeRegistrar.add('gif', 'image/gif');
    MimeTypeRegistrar.add('bmp', 'image/bmp');
    MimeTypeRegistrar.add('ico', ['image/x-icon', 'image/vnd.microsoft.icon']);
    MimeTypeRegistrar.add('svg', 'image/svg+xml');
    MimeTypeRegistrar.add('tiff', ['image/tiff', 'image/tif']);
    MimeTypeRegistrar.add('tif', ['image/tiff', 'image/tif']);
    MimeTypeRegistrar.add('avif', 'image/avif');
    MimeTypeRegistrar.add('apng', 'image/apng');
    MimeTypeRegistrar.add('jfif', 'image/jfif');
    MimeTypeRegistrar.add('pjpeg', 'image/pjpeg');
    MimeTypeRegistrar.add('pjp', 'image/pjpeg');
    MimeTypeRegistrar.add('xbm', 'image/x-xbitmap');
    MimeTypeRegistrar.add('dib', 'image/bmp');
    MimeTypeRegistrar.add('svgz', 'image/svg+xml');
    MimeTypeRegistrar.add('dds', 'image/vnd.ms-dds');
    
    // Additional image formats
    MimeTypeRegistrar.add('cur', 'image/x-icon');
    MimeTypeRegistrar.add('eps', 'image/eps');
    MimeTypeRegistrar.add('exr', 'image/x-exr');
    MimeTypeRegistrar.add('hdr', 'image/vnd.radiance');
    MimeTypeRegistrar.add('heic', 'image/heic');
    MimeTypeRegistrar.add('heif', 'image/heif');
    MimeTypeRegistrar.add('j2k', 'image/jp2');
    MimeTypeRegistrar.add('jfi', 'image/jpeg');
    MimeTypeRegistrar.add('jif', 'image/jpeg');
    MimeTypeRegistrar.add('jpe', 'image/jpeg');
    MimeTypeRegistrar.add('jxr', 'image/jxr');
    MimeTypeRegistrar.add('pbm', 'image/x-portable-bitmap');
    MimeTypeRegistrar.add('pgm', 'image/x-portable-graymap');
    MimeTypeRegistrar.add('pic', 'image/x-pict');
    MimeTypeRegistrar.add('pnm', 'image/x-portable-anymap');
    MimeTypeRegistrar.add('ppm', 'image/x-portable-pixmap');
    MimeTypeRegistrar.add('psd', 'image/vnd.adobe.photoshop');
    MimeTypeRegistrar.add('sgi', 'image/sgi');
    MimeTypeRegistrar.add('sun', 'image/x-sun-raster');
    MimeTypeRegistrar.add('wbmp', 'image/vnd.wap.wbmp');
    MimeTypeRegistrar.add('xcf', 'image/x-xcf');
    MimeTypeRegistrar.add('xpm', 'image/x-xpixmap');
}