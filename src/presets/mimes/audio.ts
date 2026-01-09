// @presets/audio.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useAudioPresets() {
    // 常见音频格式
    MimeTypeRegistrar.add('mp3', 'audio/mpeg');
    MimeTypeRegistrar.add('mp2', 'audio/mpeg');
    MimeTypeRegistrar.add('mpga', 'audio/mpeg');
    MimeTypeRegistrar.add('mp4a', 'audio/mp4');
    MimeTypeRegistrar.add('m4a', 'audio/mp4');
    MimeTypeRegistrar.add('m4b', 'audio/mp4');
    MimeTypeRegistrar.add('m4p', 'audio/mp4');
    
    MimeTypeRegistrar.add('aac', 'audio/aac');
    MimeTypeRegistrar.add('adts', 'audio/aac');
    
    MimeTypeRegistrar.add('flac', 'audio/flac');
    MimeTypeRegistrar.add('aiff', 'audio/x-aiff');
    MimeTypeRegistrar.add('aif', 'audio/x-aiff');
    MimeTypeRegistrar.add('aifc', 'audio/x-aiff');
    
    MimeTypeRegistrar.add('wav', 'audio/vnd.wav');
    MimeTypeRegistrar.add('wave', 'audio/vnd.wav');
    MimeTypeRegistrar.add('wma', 'audio/x-ms-wma');
    MimeTypeRegistrar.add('wax', 'audio/x-ms-wax');
    
    MimeTypeRegistrar.add('ogg', 'audio/ogg');
    MimeTypeRegistrar.add('oga', 'audio/ogg');
    MimeTypeRegistrar.add('opus', 'audio/opus');
    MimeTypeRegistrar.add('weba', 'audio/webm');
    MimeTypeRegistrar.add('webm', 'audio/webm');
    
    MimeTypeRegistrar.add('ra', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.add('ram', 'audio/x-pn-realaudio');
    MimeTypeRegistrar.add('rmp', 'audio/x-pn-realaudio');
    
    MimeTypeRegistrar.add('m3u', 'audio/x-mpegurl');
    MimeTypeRegistrar.add('m3u8', 'application/x-mpegURL');
    MimeTypeRegistrar.add('pls', 'audio/x-scpls');
    MimeTypeRegistrar.add('snd', 'audio/basic');
    MimeTypeRegistrar.add('tsi', 'audio/TSP-audio');
    MimeTypeRegistrar.add('tsp', 'application/dsptype');
}