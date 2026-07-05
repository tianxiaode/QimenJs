import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: true,
    },
    build: {
        // 将 Node.js 内置模块标记为外部依赖，避免浏览器构建报错
        rollupOptions: {
            external: ['fs', 'crypto', 'worker_threads', 'path', 'os', 'stream', 'util', 'buffer'],
        },
    },
});
