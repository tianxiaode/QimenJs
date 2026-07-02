import { defineConfig } from 'vite';
import path from 'path';

// OrbitJS 源码根目录
const SRC = path.resolve(__dirname, '../../../src');

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            // 映射到 OrbitJS 源码入口文件
            '@orbitjs/registry': path.resolve(SRC, 'registry/index.ts'),
            '@orbitjs/http': path.resolve(SRC, 'http/index.ts'),
            '@orbitjs/context': path.resolve(SRC, 'context/index.ts'),
            '@orbitjs/pipeline': path.resolve(SRC, 'pipeline/index.ts'),
            '@orbitjs/task': path.resolve(SRC, 'task/index.ts'),
            '@orbitjs/error': path.resolve(SRC, 'error/index.ts'),
            '@orbitjs/logger': path.resolve(SRC, 'logger/index.ts'),
            '@orbitjs/utils': path.resolve(SRC, 'utils/index.ts'),
            '@orbitjs/events': path.resolve(SRC, 'events/index.ts'),
            '@orbitjs/cache': path.resolve(SRC, 'cache/index.ts'),
            '@orbitjs/data-processor': path.resolve(SRC, 'data-processor/index.ts'),
            '@orbitjs/data-processor-abp': path.resolve(SRC, 'data-processor-abp/index.ts'),
            '@orbitjs/data-processor-spring': path.resolve(SRC, 'data-processor-spring/index.ts'),
            '@orbitjs/oauth2': path.resolve(SRC, 'oauth2/index.ts'),
            '@orbitjs/i18n': path.resolve(SRC, 'i18n/index.ts'),
            '@orbitjs/mime': path.resolve(SRC, 'mime/index.ts'),
            '@orbitjs/pattern': path.resolve(SRC, 'pattern/index.ts'),
            '@orbitjs/schema': path.resolve(SRC, 'schema/index.ts'),
            '@orbitjs/composable': path.resolve(SRC, 'composable/index.ts'),
            '@orbitjs/system-abilities': path.resolve(SRC, 'system-abilities/index.ts'),
            '@orbitjs/async': path.resolve(SRC, 'async/index.ts'),
            '@orbitjs/runtime': path.resolve(SRC, 'runtime/index.ts'),
            '@orbitjs/crypto': path.resolve(SRC, 'crypto/index.ts'),
            '@orbitjs/types': path.resolve(SRC, 'types/index.ts'),
            '@orbitjs/validation': path.resolve(SRC, 'validation/index.ts'),
            '@orbitjs/entity': path.resolve(SRC, 'entity/index.ts'),
            '@orbitjs/event-dom': path.resolve(SRC, 'event-dom/index.ts'),
            // 源码内部 @/ 路径引用
            '@': SRC,
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
