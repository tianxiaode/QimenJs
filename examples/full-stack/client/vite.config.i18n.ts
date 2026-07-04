import { defineConfig } from 'vite';
import path from 'path';

const SRC = path.resolve(__dirname, '../../../src');

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(SRC, 'i18n/index.ts'),
            name: 'orbitI18n',
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
    resolve: {
        alias: {
            '@': SRC,
        },
    },
});
