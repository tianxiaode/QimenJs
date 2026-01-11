// @presets/audio.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useAudioPresets() {
    // 常见音频格式
    MimeTypeRegistrar.register('mp3', 'audio/mpeg');
    MimeTypeRegistrar.register('mp2', 'audio/mpeg');
    MimeTypeRegistrar.register('mpga', 'audio/mpeg');
    MimeTypeRegistrar.register('mp4a', 'audio/mp4');
    MimeTypeRegistrar.register('m4a', 'audio/mp4');
    MimeTypeRegistrar.register('m4b', 'audio/mp4');
    MimeTypeRegistrar.register('m4p', 'audio/mp4');
    
    MimeTypeRegistrar.register('aac', 'audio/aac');
    MimeTypeRegistrar.register('adts', 'audio/aac');
    
    MimeTypeRegistrar.register('flac', 'audio/flac');
    MimeTypeRegistrar.register('aiff', 'audio/x-aiff');
    MimeTypeRegistrar.register('aif', 'audio/x-aiff');
    MimeTypeRegistrar.register('aifc', 'audio/x-aiff');
    
    MimeTypeRegistrar.register('wav', 'audio/vnd.wav');
    MimeTypeRegistrar.register('wave', 'audio/vnd.wav');
    MimeTypeRegistrar.register('wma', 'audio/x-ms-wma');
    MimeTypeRegistrar.register('wax', 'audio/x-ms-wax');
    
    MimeTypeRegistrar.register('ogg', 'audio/ogg');
    MimeTypeRegistrar.register('oga', 'audio/ogg');
    MimeTypeRegistrar.register('opus', 'audio/opus');
    MimeTypeRegistrar.register('weba', 'audio/webm');
    MimeTypeRegistrar.register('webm', 'audio/webm');
    
    MimeTypeRegistrar.register('ra', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.register('ram', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.register('rmp', 'audio/x-pn-realaudio');
    
    MimeTypeRegistrar.register('m3u', 'audio/x-mpegurl');
    MimeTypeRegistrar.register('m3u8', 'application/x-mpegURL');
    MimeTypeRegistrar.register('pls', 'audio/x-scpls');
    MimeTypeRegistrar.register('snd', 'audio/basic');
    MimeTypeRegistrar.register('tsi', 'audio/TSP-audio');
    MimeTypeRegistrar.register('tsp', 'application/dsptype');
}