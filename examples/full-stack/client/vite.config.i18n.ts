import { defineConfig } from 'vite';

// i18n IIFE 已由主构建脚本生成到 dist/i18n/i18n.iife.js
// 示例项目构建时，infra_setup.sh 会将其复制到 public/i18n.js
// 此配置文件保留但不再用于 i18n 构建
export default defineConfig({});
