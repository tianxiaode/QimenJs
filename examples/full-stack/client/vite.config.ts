import { defineConfig } from 'vite';
import path from 'path';

// OrbitJS 源码根目录
const SRC = path.resolve(__dirname, '../../../src');

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            // 映射到 OrbitJS 源码入口文件
            '@orbit-js/registry': path.resolve(SRC, 'registry/index.ts'),
            '@orbit-js/http': path.resolve(SRC, 'http/index.ts'),
            '@orbit-js/context': path.resolve(SRC, 'context/index.ts'),
            '@orbit-js/pipeline': path.resolve(SRC, 'pipeline/index.ts'),
            '@orbit-js/task': path.resolve(SRC, 'task/index.ts'),
            '@orbit-js/task/task': path.resolve(SRC, 'task/task/index.ts'),
            '@orbit-js/error': path.resolve(SRC, 'error/index.ts'),
            '@orbit-js/logger': path.resolve(SRC, 'logger/index.ts'),
            '@orbit-js/utils': path.resolve(SRC, 'utils/index.ts'),
            '@orbit-js/events': path.resolve(SRC, 'events/index.ts'),
            '@orbit-js/cache': path.resolve(SRC, 'cache/index.ts'),
            '@orbit-js/data-processor': path.resolve(SRC, 'data-processor/index.ts'),
            '@orbit-js/data-processor-abp': path.resolve(SRC, 'data-processor-abp/index.ts'),
            '@orbit-js/data-processor-spring': path.resolve(SRC, 'data-processor-spring/index.ts'),
            '@orbit-js/oauth2': path.resolve(SRC, 'oauth2/index.ts'),
            '@orbit-js/i18n': path.resolve(SRC, 'i18n/index.ts'),
            '@orbit-js/mime': path.resolve(SRC, 'mime/index.ts'),
            '@orbit-js/pattern': path.resolve(SRC, 'pattern/index.ts'),
            '@orbit-js/schema': path.resolve(SRC, 'schema/index.ts'),
            '@orbit-js/composable': path.resolve(SRC, 'composable/index.ts'),
            '@orbit-js/system-abilities': path.resolve(SRC, 'system-abilities/index.ts'),
            '@orbit-js/async': path.resolve(SRC, 'async/index.ts'),
            '@orbit-js/runtime': path.resolve(SRC, 'runtime/index.ts'),
            '@orbit-js/crypto': path.resolve(SRC, 'crypto/index.ts'),
            '@orbit-js/types': path.resolve(SRC, 'types/index.ts'),
            '@orbit-js/validation': path.resolve(SRC, 'validation/index.ts'),
            '@orbit-js/entity': path.resolve(SRC, 'entity/index.ts'),
            '@orbit-js/event-dom': path.resolve(SRC, 'event-dom/index.ts'),
            // 源码内部 @/ 路径引用
            '@': SRC,
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
