import { defineConfig } from 'vite';
import path from 'path';

const NODE_MODULES = path.resolve(__dirname, '../node_modules/@qimen-lab/core/dist/i18n');

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(NODE_MODULES, 'index.esm.js'),
            name: 'qimenI18n',
            formats: ['iife'],
            fileName: () => 'i18n.js',
        },
        outDir: path.resolve(__dirname, 'public'),
        emptyOutDir: false,
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
});
