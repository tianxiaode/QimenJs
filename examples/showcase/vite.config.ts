import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { qimenCssPlugin } from '../../build-tools/vite-plugin-qimen-css';

/** 将 Node.js 专用模块替换为 Proxy 空壳，避免浏览器环境报错 */
function browserExternalPlugin(): Plugin {
    const VIRTUAL_PREFIX = '\0browser-external:';
    const EXTERNAL_MODULES = [
        'worker_threads',
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'http',
        'https',
        'url',
        'util',
        'buffer',
    ];
    const PROXY_MODULE = `
const handler = { get: () => new Proxy(function(){}, handler), apply: () => new Proxy(function(){}, handler) };
export default new Proxy({}, handler);
export const promises = new Proxy({}, handler);
export const parentPort = null;
`;
    return {
        name: 'browser-external',
        enforce: 'pre',
        resolveId(source: string) {
            if (EXTERNAL_MODULES.includes(source)) return VIRTUAL_PREFIX + source;
        },
        load(id: string) {
            if (id.startsWith(VIRTUAL_PREFIX)) return PROXY_MODULE;
        },
    };
}

export default defineConfig({
    plugins: [
        browserExternalPlugin(),
        qimenCssPlugin({
            entryPoints: ['src/main.ts', 'src/pages/**/*.ts'],
            componentRoot: '../../src/component',
            emitFile: true,
            outputFileName: 'qimen-components.css',
            injectInDev: true,
            debug: true,
        }),
    ],
    resolve: {
        alias: [
            { find: /^@\/(.+)/, replacement: resolve(__dirname, '../../src/$1') },
            { find: '@qimenjs/async', replacement: resolve(__dirname, '../../src/async') },
            { find: '@qimenjs/error', replacement: resolve(__dirname, '../../src/error') },
            { find: '@qimenjs/logger', replacement: resolve(__dirname, '../../src/logger') },
            { find: '@qimenjs/runtime', replacement: resolve(__dirname, '../../src/runtime') },
            { find: '@qimenjs/events', replacement: resolve(__dirname, '../../src/events') },
            { find: '@qimenjs/event-dom', replacement: resolve(__dirname, '../../src/event-dom') },
            { find: '@qimenjs/utils', replacement: resolve(__dirname, '../../src/utils') },
            {
                find: '@qimenjs/validation',
                replacement: resolve(__dirname, '../../src/validation'),
            },
            { find: '@qimenjs/task', replacement: resolve(__dirname, '../../src/task') },
            { find: '@qimenjs/crypto', replacement: resolve(__dirname, '../../src/crypto') },
            { find: '@qimenjs/registry', replacement: resolve(__dirname, '../../src/registry') },
            { find: '@qimenjs/schema', replacement: resolve(__dirname, '../../src/schema') },
            { find: '@qimenjs/context', replacement: resolve(__dirname, '../../src/context') },
            { find: '@qimenjs/cache', replacement: resolve(__dirname, '../../src/cache') },
            { find: '@qimenjs/pipeline', replacement: resolve(__dirname, '../../src/pipeline') },
            {
                find: '@qimenjs/composable',
                replacement: resolve(__dirname, '../../src/composable'),
            },
            {
                find: '@qimenjs/data-processor',
                replacement: resolve(__dirname, '../../src/data-processor'),
            },
            { find: '@qimenjs/http', replacement: resolve(__dirname, '../../src/http') },
            {
                find: '@qimenjs/system-abilities',
                replacement: resolve(__dirname, '../../src/system-abilities'),
            },
            { find: '@qimenjs/entity', replacement: resolve(__dirname, '../../src/entity') },
            { find: '@qimenjs/i18n', replacement: resolve(__dirname, '../../src/i18n') },
            { find: '@qimenjs/mime', replacement: resolve(__dirname, '../../src/mime') },
            { find: '@qimenjs/pattern', replacement: resolve(__dirname, '../../src/pattern') },
            {
                find: '@qimenjs/data-processor-abp',
                replacement: resolve(__dirname, '../../src/data-processor-abp'),
            },
            {
                find: '@qimenjs/data-processor-spring',
                replacement: resolve(__dirname, '../../src/data-processor-spring'),
            },
            { find: '@qimenjs/oauth2', replacement: resolve(__dirname, '../../src/oauth2') },
            { find: '@qimenjs/types', replacement: resolve(__dirname, '../../src/types') },
            { find: '@qimenjs/theme', replacement: resolve(__dirname, '../../src/theme') },
            {
                find: '@qimenjs/component-abilities',
                replacement: resolve(__dirname, '../../src/component-abilities'),
            },
            {
                find: '@qimenjs/component-core',
                replacement: resolve(__dirname, '../../src/component-core'),
            },
            { find: '@qimenjs/component', replacement: resolve(__dirname, '../../src/component') },
            { find: '@qimenjs/markdown', replacement: resolve(__dirname, '../../src/markdown') },
            {
                find: '@qimenjs/imperative',
                replacement: resolve(__dirname, '../../src/imperative'),
            },
            { find: '@qimenjs/router', replacement: resolve(__dirname, '../../src/router') },
            { find: '@qimenjs/drag', replacement: resolve(__dirname, '../../src/drag') },
            { find: '@qimenjs/file', replacement: resolve(__dirname, '../../src/file') },
            {
                find: '@qimenjs/permission',
                replacement: resolve(__dirname, '../../src/permission'),
            },
        ],
    },
    server: {
        port: 3000,
        open: true,
        fs: {
            allow: [resolve(__dirname, '../..')],
        },
    },
});
