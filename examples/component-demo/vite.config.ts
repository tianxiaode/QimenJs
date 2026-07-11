import { defineConfig } from 'vite';
import path from 'path';

const srcRoot = path.resolve(__dirname, '../../src');

export default defineConfig({
    root: '.',
    server: {
        port: 5174,
        open: true,
        fs: {
            // 允许 Vite 提供项目根目录之外的文件（@fs 访问）
            allow: ['..', '../..'],
        },
    },
    resolve: {
        alias: {
            // 框架源码路径别名，直接引用 src 源码
            '@qimenjs/composable': path.join(srcRoot, 'composable'),
            '@qimenjs/registry': path.join(srcRoot, 'registry'),
            '@qimenjs/events': path.join(srcRoot, 'events'),
            '@qimenjs/logger': path.join(srcRoot, 'logger'),
            '@qimenjs/async': path.join(srcRoot, 'async'),
            '@qimenjs/utils': path.join(srcRoot, 'utils'),
            '@qimenjs/error': path.join(srcRoot, 'error'),
            '@qimenjs/runtime': path.join(srcRoot, 'runtime'),
            '@qimenjs/context': path.join(srcRoot, 'context'),
            '@qimenjs/pipeline': path.join(srcRoot, 'pipeline'),
            '@qimenjs/schema': path.join(srcRoot, 'schema'),
            '@qimenjs/cache': path.join(srcRoot, 'cache'),
            '@qimenjs/task': path.join(srcRoot, 'task'),
            '@qimenjs/template': path.join(srcRoot, 'template'),
            '@qimenjs/layout': path.join(srcRoot, 'layout'),
            '@qimenjs/theme': path.join(srcRoot, 'theme'),
            '@qimenjs/system-abilities': path.join(srcRoot, 'system-abilities'),
            '@qimenjs/event-dom': path.join(srcRoot, 'event-dom'),
            '@qimenjs/component-core': path.join(srcRoot, 'component-core'),
            '@qimenjs/component-abilities': path.join(srcRoot, 'component-abilities'),
            '@qimenjs/component': path.join(srcRoot, 'component'),
            '@qimenjs/router': path.join(srcRoot, 'router'),
            '@qimenjs/i18n': path.join(srcRoot, 'i18n'),
            '@qimenjs/validation': path.join(srcRoot, 'validation'),
            '@qimenjs/mime': path.join(srcRoot, 'mime'),
            '@qimenjs/pattern': path.join(srcRoot, 'pattern'),
            '@qimenjs/data-processor': path.join(srcRoot, 'data-processor'),
            '@qimenjs/http': path.join(srcRoot, 'http'),
            '@qimenjs/oauth2': path.join(srcRoot, 'oauth2'),
            '@qimenjs/entity': path.join(srcRoot, 'entity'),
            '@qimenjs/data-processor-abp': path.join(srcRoot, 'data-processor-abp'),
            '@qimenjs/data-processor-spring': path.join(srcRoot, 'data-processor-spring'),
            '@qimenjs/types': path.join(srcRoot, 'types'),
            '@qimenjs/crypto': path.join(srcRoot, 'crypto'),
            '@qimenjs/imperative': path.join(srcRoot, 'imperative'),
            '@qimenjs/permission': path.join(srcRoot, 'permission'),
            // 图标 CSS（纯资源，不是 TS 模块）
            '@qimenjs/icon': path.join(srcRoot, 'icon'),
            // tsconfig 中的 @ 别名
            '@': srcRoot,
        },
    },
    build: {
        rollupOptions: {
            external: ['fs', 'crypto', 'worker_threads', 'path', 'os', 'stream', 'util', 'buffer'],
        },
    },
});
