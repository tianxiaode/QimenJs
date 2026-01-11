// @presets/video.ts
import { MimeTypeRegistrar } from '../../registry/registrars/MimeTypeRegistrar';

export function useVideoPresets() {
    const registrar = MimeTypeRegistrar.getInstance();
    
    // Standard video formats
    registrar.register({
        'mp4': 'video/mp4',
        'm4v': 'video/mp4',
        'mp4v': 'video/mp4',
        'mpg4': 'video/mp4',
        
        'mov': 'video/quicktime',
        'qt': 'video/quicktime',
        
        'mpeg': 'video/mpeg',
        'mpg': 'video/mpeg',
        'mpe': 'video/mpeg',
        'm1v': 'video/mpeg',
        'm2v': 'video/mpeg',
        
        'mpv': 'video/mpv',
        'm2t': 'video/mp2t',
        
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'mk3d': 'video/x-matroska',
        
        'avi': 'video/x-msvideo',
        'wmv': 'video/x-ms-wmv',
        'asf': 'video/x-ms-asf',
        'asx': 'video/x-ms-asf',
        
        'flv': 'video/x-flv',  // 只保留一个 flv 定义
        'f4v': 'video/mp4',
        'f4p': 'video/mp4',
        
        'm4f': 'application/mp4',
        'm4p': 'application/mp4',
        'm4b': 'audio/mp4',
        'm4r': 'audio/ringtone',
        
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2',
        
        'h323': 'text/h323',
        'hdmov': 'video/x-motion-jpeg',
        
        'ogv': 'video/ogg',
        'ogg': 'video/ogg',
        
        'vob': 'video/mpeg',  // 将 vob 统一到 video/mpeg
        
        'rm': 'application/vnd.rn-realmedia',
        'rmvb': 'application/vnd.rn-realmedia-vbr',
        'ram': 'audio/x-pn-realaudio',
        'ra': 'audio/x-pn-realaudio',
        
        'm3u8': 'application/x-mpegURL',
        'ts': 'video/mp2t',
        
        // registeritional video formats
        'divx': 'video/vnd.divx',
        'evo': 'video/vnd.evo',
        'fli': 'video/x-fli',
        'h261': 'video/h261',
        'h263': 'video/h263',
        'h264': 'video/h264',
        'hevc': 'video/hevc',
        'm4e': 'video/mp4',
        'mjp2': 'video/mj2',
        'mjpeg': 'video/x-mjpeg',
        'mjpg': 'video/x-mjpeg',
        'mp1v': 'video/mpeg',
        'mp2v': 'video/mpeg',
        'ogm': 'video/ogg',
        'qtl': 'application/x-quicktimeplayer',
        'rv': 'video/vnd.rn-realvideo',
        'uvh': 'video/vnd.dece.hd',
        'uvm': 'video/vnd.dece.mobile',
        'uvp': 'video/vnd.dece.pd',
        'uvs': 'video/vnd.dece.sd',
        'uvv': 'video/vnd.dece.video',
        'vdo': 'video/vdo',
        'viv': 'video/vnd.vivo',
        'vivo': 'video/vnd.vivo',
        'wm': 'video/x-ms-wm',
        'wmp': 'video/x-ms-wmp',
        'wmx': 'video/x-ms-wmx',
        'wvx': 'video/x-ms-wvx',
        'xdr': 'video/x-amt-demorun'
    });
}