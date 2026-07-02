import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            // 映射到 OrbitJS 源码目录
            '@orbitjs/registry': path.resolve(__dirname, '../../src/registry'),
            '@orbitjs/http': path.resolve(__dirname, '../../src/http'),
            '@orbitjs/context': path.resolve(__dirname, '../../src/context'),
            '@orbitjs/pipeline': path.resolve(__dirname, '../../src/pipeline'),
            '@orbitjs/task': path.resolve(__dirname, '../../src/task'),
            '@orbitjs/error': path.resolve(__dirname, '../../src/error'),
            '@orbitjs/logger': path.resolve(__dirname, '../../src/logger'),
            '@orbitjs/utils': path.resolve(__dirname, '../../src/utils'),
            '@orbitjs/events': path.resolve(__dirname, '../../src/events'),
            '@orbitjs/cache': path.resolve(__dirname, '../../src/cache'),
            '@orbitjs/data-processor': path.resolve(__dirname, '../../src/data-processor'),
            '@orbitjs/data-processor-abp': path.resolve(__dirname, '../../src/data-processor-abp'),
            '@orbitjs/data-processor-spring': path.resolve(__dirname, '../../src/data-processor-spring'),
            '@orbitjs/oauth2': path.resolve(__dirname, '../../src/oauth2'),
            '@orbitjs/i18n': path.resolve(__dirname, '../../src/i18n'),
            '@orbitjs/mime': path.resolve(__dirname, '../../src/mime'),
            '@orbitjs/pattern': path.resolve(__dirname, '../../src/pattern'),
            '@orbitjs/schema': path.resolve(__dirname, '../../src/schema'),
            '@orbitjs/composable': path.resolve(__dirname, '../../src/composable'),
            '@orbitjs/system-abilities': path.resolve(__dirname, '../../src/system-abilities'),
            '@orbitjs/async': path.resolve(__dirname, '../../src/async'),
            '@orbitjs/runtime': path.resolve(__dirname, '../../src/runtime'),
            '@orbitjs/crypto': path.resolve(__dirname, '../../src/crypto'),
            '@orbitjs/types': path.resolve(__dirname, '../../src/types'),
            '@orbitjs/validation': path.resolve(__dirname, '../../src/validation'),
            '@orbitjs/entity': path.resolve(__dirname, '../../src/entity'),
            '@orbitjs/event-dom': path.resolve(__dirname, '../../src/event-dom'),
            '@': path.resolve(__dirname, '../../src'),
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
