import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: true,
    },
    resolve: {
        // 优先解析 ESM 文件，避免 Vite 走 CJS 路径导致循环依赖
        conditions: ['import'],
    },
});
