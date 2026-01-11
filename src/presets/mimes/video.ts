// @presets/video.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useVideoPresets() {
    // Standard video formats
    MimeTypeRegistrar.register('mp4', 'video/mp4');
    MimeTypeRegistrar.register('m4v', 'video/mp4');
    MimeTypeRegistrar.register('mp4v', 'video/mp4');
    MimeTypeRegistrar.register('mpg4', 'video/mp4');
    
    MimeTypeRegistrar.register('mov', 'video/quicktime');
    MimeTypeRegistrar.register('qt', 'video/quicktime');
    
    MimeTypeRegistrar.register('mpeg', 'video/mpeg');
    MimeTypeRegistrar.register('mpg', 'video/mpeg');
    MimeTypeRegistrar.register('mpe', 'video/mpeg');
    MimeTypeRegistrar.register('m1v', 'video/mpeg');
    MimeTypeRegistrar.register('m2v', 'video/mpeg');
    
    MimeTypeRegistrar.register('mpv', 'video/mpv');
    MimeTypeRegistrar.register('m2t', 'video/mp2t');
    
    MimeTypeRegistrar.register('webm', 'video/webm');
    MimeTypeRegistrar.register('mkv', 'video/x-matroska');
    MimeTypeRegistrar.register('mk3d', 'video/x-matroska');
    
    MimeTypeRegistrar.register('avi', 'video/x-msvideo');
    MimeTypeRegistrar.register('wmv', 'video/x-ms-wmv');
    MimeTypeRegistrar.register('asf', 'video/x-ms-asf');
    MimeTypeRegistrar.register('asx', 'video/x-ms-asf');
    
    MimeTypeRegistrar.register('flv', 'video/x-flv');
    MimeTypeRegistrar.register('f4v', 'video/mp4');
    MimeTypeRegistrar.register('f4p', 'video/mp4');
    
    MimeTypeRegistrar.register('m4f', 'application/mp4');
    MimeTypeRegistrar.register('m4p', 'application/mp4');
    MimeTypeRegistrar.register('m4b', 'audio/mp4');
    MimeTypeRegistrar.register('m4r', 'audio/ringtone');
    
    MimeTypeRegistrar.register('3gp', 'video/3gpp');
    MimeTypeRegistrar.register('3g2', 'video/3gpp2');
    
    MimeTypeRegistrar.register('h323', 'text/h323');
    MimeTypeRegistrar.register('hdmov', 'video/x-motion-jpeg');
    
    MimeTypeRegistrar.register('ogv', 'video/ogg');
    MimeTypeRegistrar.register('ogg', 'video/ogg');
    
    MimeTypeRegistrar.register('vob', 'video/dvd');
    MimeTypeRegistrar.register('ifo', 'video/dvd');
    
    MimeTypeRegistrar.register('rm', 'application/vnd.rn-realmedia');
    MimeTypeRegistrar.register('rmvb', 'application/vnd.rn-realmedia-vbr');
    MimeTypeRegistrar.register('ram', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.register('ra', 'audio/x-pn-realaudio');
    
    MimeTypeRegistrar.register('m3u8', 'application/x-mpegURL');
    MimeTypeRegistrar.register('ts', 'video/mp2t');
    
    // registeritional video formats
    MimeTypeRegistrar.register('divx', 'video/vnd.divx');
    MimeTypeRegistrar.register('evo', 'video/vnd.evo');
    MimeTypeRegistrar.register('fli', 'video/x-fli');
    MimeTypeRegistrar.register('flv', 'video/x-flv');
    MimeTypeRegistrar.register('h261', 'video/h261');
    MimeTypeRegistrar.register('h263', 'video/h263');
    MimeTypeRegistrar.register('h264', 'video/h264');
    MimeTypeRegistrar.register('hevc', 'video/hevc');
    MimeTypeRegistrar.register('m1v', 'video/mpeg');
    MimeTypeRegistrar.register('m2v', 'video/mpeg');
    MimeTypeRegistrar.register('m4e', 'video/mp4');
    MimeTypeRegistrar.register('mjp2', 'video/mj2');
    MimeTypeRegistrar.register('mjpeg', 'video/x-mjpeg');
    MimeTypeRegistrar.register('mjpg', 'video/x-mjpeg');
    MimeTypeRegistrar.register('mp1v', 'video/mpeg');
    MimeTypeRegistrar.register('mp2v', 'video/mpeg');
    MimeTypeRegistrar.register('mp4v', 'video/mp4');
    MimeTypeRegistrar.register('mpe', 'video/mpeg');
    MimeTypeRegistrar.register('mpg', 'video/mpeg');
    MimeTypeRegistrar.register('mpeg', 'video/mpeg');
    MimeTypeRegistrar.register('mpv', 'video/mpv');
    MimeTypeRegistrar.register('ogm', 'video/ogg');
    MimeTypeRegistrar.register('qt', 'video/quicktime');
    MimeTypeRegistrar.register('qtl', 'application/x-quicktimeplayer');
    MimeTypeRegistrar.register('rv', 'video/vnd.rn-realvideo');
    MimeTypeRegistrar.register('uvh', 'video/vnd.dece.hd');
    MimeTypeRegistrar.register('uvm', 'video/vnd.dece.mobile');
    MimeTypeRegistrar.register('uvp', 'video/vnd.dece.pd');
    MimeTypeRegistrar.register('uvs', 'video/vnd.dece.sd');
    MimeTypeRegistrar.register('uvv', 'video/vnd.dece.video');
    MimeTypeRegistrar.register('vdo', 'video/vdo');
    MimeTypeRegistrar.register('viv', 'video/vnd.vivo');
    MimeTypeRegistrar.register('vivo', 'video/vnd.vivo');
    MimeTypeRegistrar.register('vob', 'video/mpeg');
    MimeTypeRegistrar.register('wm', 'video/x-ms-wm');
    MimeTypeRegistrar.register('wmp', 'video/x-ms-wmp');
    MimeTypeRegistrar.register('wmv', 'video/x-ms-wmv');
    MimeTypeRegistrar.register('wmx', 'video/x-ms-wmx');
    MimeTypeRegistrar.register('wvx', 'video/x-ms-wvx');
    MimeTypeRegistrar.register('xdr', 'video/x-amt-demorun');
    MimeTypeRegistrar.register('xsr', 'video/x-amt-showrun');
}