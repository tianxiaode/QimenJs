// @presets/audio.ts
import { MimeTypeRegistrar } from '../../registry/registrars/MimeTypeRegistrar';

export function useAudioPresets() {
    const registrar = MimeTypeRegistrar.getInstance();
    
    // 常见音频格式
    registrar.register({
        'mp3': 'audio/mpeg',
        'mp2': 'audio/mpeg',
        'mpga': 'audio/mpeg',
        'mp4a': 'audio/mp4',
        'm4a': 'audio/mp4',
        'm4b': 'audio/mp4',
        'm4p': 'audio/mp4',
        
        'aac': 'audio/aac',
        'adts': 'audio/aac',
        
        'flac': 'audio/flac',
        'aiff': 'audio/x-aiff',
        'aif': 'audio/x-aiff',
        'aifc': 'audio/x-aiff',
        
        'wav': 'audio/vnd.wav',
        'wave': 'audio/vnd.wav',
        'wma': 'audio/x-ms-wma',
        'wax': 'audio/x-ms-wax',
        
        'ogg': 'audio/ogg',
        'oga': 'audio/ogg',
        'opus': 'audio/opus',
        'weba': 'audio/webm',
        'webm': 'audio/webm',
        
        'ra': 'audio/x-pn-realaudio',
        'ram': 'audio/x-pn-realaudio',
        'rmp': 'audio/x-pn-realaudio',
        
        'm3u': 'audio/x-mpegurl',
        'm3u8': 'application/x-mpegURL',
        'pls': 'audio/x-scpls',
        'snd': 'audio/basic',
        'tsi': 'audio/TSP-audio',
        'tsp': 'application/dsptype'
    });
}