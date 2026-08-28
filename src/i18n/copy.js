#!/usr/bin/env node
/**
 * i18n 文件复制脚本
 *
 * 用法: npx qimen-i18n-copy
 *
 * 将 i18n.iife.js 和 locales/ 下的语言包复制到目标 public 目录，
 * 供 HTML 中 <script> 标签加载。
 *
 * 默认目标: project/public/
 * 可通过 --out-dir 参数指定:
 *   npx qimen-i18n-copy --out-dir ./public
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.resolve(__dirname);
const DEFAULT_OUT_DIR = path.resolve(process.cwd(), 'public');

function copyFile(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${path.relative(process.cwd(), dest)}`);
}

function main() {
    const args = process.argv.slice(2);
    const outDirIndex = args.indexOf('--out-dir');
    const outDir = outDirIndex !== -1 ? path.resolve(process.cwd(), args[outDirIndex + 1]) : DEFAULT_OUT_DIR;

    console.log(`\n  i18n: 复制文件到 ${path.relative(process.cwd(), outDir)}\n`);

    const iifeSrc = path.join(SOURCE_DIR, 'i18n.iife.js');
    const iifeDest = path.join(outDir, 'qimen-i18n.js');
    copyFile(iifeSrc, iifeDest);

    const localesDir = path.join(SOURCE_DIR, 'locales');
    if (fs.existsSync(localesDir)) {
        const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.js'));
        const localesDest = path.join(outDir, 'locales');
        for (const file of localeFiles) {
            copyFile(path.join(localesDir, file), path.join(localesDest, file));
        }
    }

    console.log(`\n  ✓ 完成\n`);
}

main();