#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 加载配置
const configPath = path.join(__dirname, 'build-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const projectRoot = path.resolve(__dirname, '..');
const exampleDir = path.join(projectRoot, 'examples', 'full-stack');
const targetDir = path.join(exampleDir, 'node_modules', '@qimen-lab');

console.log('📦 QimenJS Local Linker');
console.log('======================\n');

// 1. 安装非 @qimen-lab 依赖
console.log('1. 安装第三方依赖...');
try {
    execSync('pnpm install --no-optional', {
        cwd: exampleDir,
        stdio: 'inherit',
    });
} catch {
    // pnpm install 可能因为 @qimen-lab 包不存在而失败，忽略错误
    console.log('  ⚠️  pnpm install 部分失败（预期行为，@qimen-lab 包尚未发布）');
}

// 2. 确保 @qimen-lab 目录存在
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 3. 遍历每个模块，创建符号链接
console.log('\n2. 链接本地包...');
let linked = 0;
for (const [moduleName, moduleConfig] of Object.entries(config.modules)) {
    const distDir = path.resolve(projectRoot, moduleConfig.outDir);
    const linkPath = path.join(targetDir, moduleName);

    if (!fs.existsSync(distDir)) {
        console.log(`  ⏭️  ${moduleName}: 跳过（未构建）`);
        continue;
    }

    // 移除已有的链接/目录
    if (fs.existsSync(linkPath)) {
        fs.rmSync(linkPath, { recursive: true, force: true });
    }

    // 创建符号链接
    try {
        const linkType = process.platform === 'win32' ? 'junction' : 'dir';
        fs.symlinkSync(distDir, linkPath, linkType);
        console.log(`  ✅ ${moduleConfig.packageName} → ${distDir}`);
        linked++;
    } catch (error) {
        // 如果符号链接失败，尝试复制
        console.log(`  ⚠️  符号链接失败，使用复制: ${moduleName}`);
        fs.cpSync(distDir, linkPath, { recursive: true });
        console.log(`  ✅ ${moduleConfig.packageName} (copied)`);
        linked++;
    }
}

console.log(`\n📦 已链接 ${linked} 个本地包到 examples/full-stack/node_modules/@qimen-lab/`);
