import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: true,
    },
    resolve: {
        // 保留符号链接，让 pnpm 链接的本地包能正确解析
        preserveSymlinks: true,
    },
    build: {
        // 将 Node.js 内置模块标记为外部依赖，避免浏览器构建报错
        rollupOptions: {
            external: ['fs', 'crypto', 'worker_threads', 'path', 'os', 'stream', 'util', 'buffer'],
        },
    },
});
