// @presets/video.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useVideoPresets() {
    // Standard video formats
    MimeTypeRegistrar.add('mp4', 'video/mp4');
    MimeTypeRegistrar.add('m4v', 'video/mp4');
    MimeTypeRegistrar.add('mp4v', 'video/mp4');
    MimeTypeRegistrar.add('mpg4', 'video/mp4');
    
    MimeTypeRegistrar.add('mov', 'video/quicktime');
    MimeTypeRegistrar.add('qt', 'video/quicktime');
    
    MimeTypeRegistrar.add('mpeg', 'video/mpeg');
    MimeTypeRegistrar.add('mpg', 'video/mpeg');
    MimeTypeRegistrar.add('mpe', 'video/mpeg');
    MimeTypeRegistrar.add('m1v', 'video/mpeg');
    MimeTypeRegistrar.add('m2v', 'video/mpeg');
    
    MimeTypeRegistrar.add('mpv', 'video/mpv');
    MimeTypeRegistrar.add('m2t', 'video/mp2t');
    
    MimeTypeRegistrar.add('webm', 'video/webm');
    MimeTypeRegistrar.add('mkv', 'video/x-matroska');
    MimeTypeRegistrar.add('mk3d', 'video/x-matroska');
    
    MimeTypeRegistrar.add('avi', 'video/x-msvideo');
    MimeTypeRegistrar.add('wmv', 'video/x-ms-wmv');
    MimeTypeRegistrar.add('asf', 'video/x-ms-asf');
    MimeTypeRegistrar.add('asx', 'video/x-ms-asf');
    
    MimeTypeRegistrar.add('flv', 'video/x-flv');
    MimeTypeRegistrar.add('f4v', 'video/mp4');
    MimeTypeRegistrar.add('f4p', 'video/mp4');
    
    MimeTypeRegistrar.add('m4f', 'application/mp4');
    MimeTypeRegistrar.add('m4p', 'application/mp4');
    MimeTypeRegistrar.add('m4b', 'audio/mp4');
    MimeTypeRegistrar.add('m4r', 'audio/ringtone');
    
    MimeTypeRegistrar.add('3gp', 'video/3gpp');
    MimeTypeRegistrar.add('3g2', 'video/3gpp2');
    
    MimeTypeRegistrar.add('h323', 'text/h323');
    MimeTypeRegistrar.add('hdmov', 'video/x-motion-jpeg');
    
    MimeTypeRegistrar.add('ogv', 'video/ogg');
    MimeTypeRegistrar.add('ogg', 'video/ogg');
    
    MimeTypeRegistrar.add('vob', 'video/dvd');
    MimeTypeRegistrar.add('ifo', 'video/dvd');
    
    MimeTypeRegistrar.add('rm', 'application/vnd.rn-realmedia');
    MimeTypeRegistrar.add('rmvb', 'application/vnd.rn-realmedia-vbr');
    MimeTypeRegistrar.add('ram', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.add('ra', 'audio/x-pn-realaudio');
    
    MimeTypeRegistrar.add('m3u8', 'application/x-mpegURL');
    MimeTypeRegistrar.add('ts', 'video/mp2t');
    
    // Additional video formats
    MimeTypeRegistrar.add('divx', 'video/vnd.divx');
    MimeTypeRegistrar.add('evo', 'video/vnd.evo');
    MimeTypeRegistrar.add('fli', 'video/x-fli');
    MimeTypeRegistrar.add('flv', 'video/x-flv');
    MimeTypeRegistrar.add('h261', 'video/h261');
    MimeTypeRegistrar.add('h263', 'video/h263');
    MimeTypeRegistrar.add('h264', 'video/h264');
    MimeTypeRegistrar.add('hevc', 'video/hevc');
    MimeTypeRegistrar.add('m1v', 'video/mpeg');
    MimeTypeRegistrar.add('m2v', 'video/mpeg');
    MimeTypeRegistrar.add('m4e', 'video/mp4');
    MimeTypeRegistrar.add('mjp2', 'video/mj2');
    MimeTypeRegistrar.add('mjpeg', 'video/x-mjpeg');
    MimeTypeRegistrar.add('mjpg', 'video/x-mjpeg');
    MimeTypeRegistrar.add('mp1v', 'video/mpeg');
    MimeTypeRegistrar.add('mp2v', 'video/mpeg');
    MimeTypeRegistrar.add('mp4v', 'video/mp4');
    MimeTypeRegistrar.add('mpe', 'video/mpeg');
    MimeTypeRegistrar.add('mpg', 'video/mpeg');
    MimeTypeRegistrar.add('mpeg', 'video/mpeg');
    MimeTypeRegistrar.add('mpv', 'video/mpv');
    MimeTypeRegistrar.add('ogm', 'video/ogg');
    MimeTypeRegistrar.add('qt', 'video/quicktime');
    MimeTypeRegistrar.add('qtl', 'application/x-quicktimeplayer');
    MimeTypeRegistrar.add('rv', 'video/vnd.rn-realvideo');
    MimeTypeRegistrar.add('uvh', 'video/vnd.dece.hd');
    MimeTypeRegistrar.add('uvm', 'video/vnd.dece.mobile');
    MimeTypeRegistrar.add('uvp', 'video/vnd.dece.pd');
    MimeTypeRegistrar.add('uvs', 'video/vnd.dece.sd');
    MimeTypeRegistrar.add('uvv', 'video/vnd.dece.video');
    MimeTypeRegistrar.add('vdo', 'video/vdo');
    MimeTypeRegistrar.add('viv', 'video/vnd.vivo');
    MimeTypeRegistrar.add('vivo', 'video/vnd.vivo');
    MimeTypeRegistrar.add('vob', 'video/mpeg');
    MimeTypeRegistrar.add('wm', 'video/x-ms-wm');
    MimeTypeRegistrar.add('wmp', 'video/x-ms-wmp');
    MimeTypeRegistrar.add('wmv', 'video/x-ms-wmv');
    MimeTypeRegistrar.add('wmx', 'video/x-ms-wmx');
    MimeTypeRegistrar.add('wvx', 'video/x-ms-wvx');
    MimeTypeRegistrar.add('xdr', 'video/x-amt-demorun');
    MimeTypeRegistrar.add('xsr', 'video/x-amt-showrun');
}