import { defineConfig } from 'vite';
import path from 'path';

// OrbitJS 源码根目录
const SRC = path.resolve(__dirname, '../../../src');

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            // 映射到 OrbitJS 源码入口文件
            '@qimenjs/registry': path.resolve(SRC, 'registry/index.ts'),
            '@qimenjs/http': path.resolve(SRC, 'http/index.ts'),
            '@qimenjs/context': path.resolve(SRC, 'context/index.ts'),
            '@qimenjs/pipeline': path.resolve(SRC, 'pipeline/index.ts'),
            '@qimenjs/task': path.resolve(SRC, 'task/index.ts'),
            '@qimenjs/task/task': path.resolve(SRC, 'task/task/index.ts'),
            '@qimenjs/error': path.resolve(SRC, 'error/index.ts'),
            '@qimenjs/logger': path.resolve(SRC, 'logger/index.ts'),
            '@qimenjs/utils': path.resolve(SRC, 'utils/index.ts'),
            '@qimenjs/events': path.resolve(SRC, 'events/index.ts'),
            '@qimenjs/cache': path.resolve(SRC, 'cache/index.ts'),
            '@qimenjs/data-processor': path.resolve(SRC, 'data-processor/index.ts'),
            '@qimenjs/data-processor-abp': path.resolve(SRC, 'data-processor-abp/index.ts'),
            '@qimenjs/data-processor-spring': path.resolve(SRC, 'data-processor-spring/index.ts'),
            '@qimenjs/oauth2': path.resolve(SRC, 'oauth2/index.ts'),
            '@qimenjs/i18n': path.resolve(SRC, 'i18n/index.ts'),
            '@qimenjs/mime': path.resolve(SRC, 'mime/index.ts'),
            '@qimenjs/pattern': path.resolve(SRC, 'pattern/index.ts'),
            '@qimenjs/schema': path.resolve(SRC, 'schema/index.ts'),
            '@qimenjs/composable': path.resolve(SRC, 'composable/index.ts'),
            '@qimenjs/system-abilities': path.resolve(SRC, 'system-abilities/index.ts'),
            '@qimenjs/async': path.resolve(SRC, 'async/index.ts'),
            '@qimenjs/runtime': path.resolve(SRC, 'runtime/index.ts'),
            '@qimenjs/crypto': path.resolve(SRC, 'crypto/index.ts'),
            '@qimenjs/types': path.resolve(SRC, 'types/index.ts'),
            '@qimenjs/validation': path.resolve(SRC, 'validation/index.ts'),
            '@qimenjs/entity': path.resolve(SRC, 'entity/index.ts'),
            '@qimenjs/event-dom': path.resolve(SRC, 'event-dom/index.ts'),
            // 源码内部 @/ 路径引用
            '@': SRC,
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
