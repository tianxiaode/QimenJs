#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 加载配置
const configPath = path.join(__dirname, 'build-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📦 QimenJS Publisher');
console.log('==================\n');

// 检查是否已登录
try {
    execSync('npm whoami', { stdio: 'pipe' });
} catch {
    console.error('❌ 请先登录 npm: npm login');
    process.exit(1);
}

// 按依赖顺序发布（拓扑排序）
const visited = new Set();
const order = [];

function visit(name) {
    if (visited.has(name)) return;
    visited.add(name);
    const module = config.modules[name];
    if (module.dependencies) {
        module.dependencies.forEach(dep => visit(dep));
    }
    order.push(name);
}

Object.keys(config.modules).forEach(name => visit(name));

let success = 0;
let failed = 0;

for (const moduleName of order) {
    const moduleConfig = config.modules[moduleName];
    const distDir = path.resolve(__dirname, '..', moduleConfig.outDir);
    const pkgPath = path.join(distDir, 'package.json');

    if (!fs.existsSync(pkgPath)) {
        console.log(`⏭️  ${moduleName}: 跳过（未构建）`);
        continue;
    }

    // 复制 LICENSE 和 README 到 dist 目录
    const rootDir = path.resolve(__dirname, '..');
    if (fs.existsSync(path.join(rootDir, 'LICENSE'))) {
        fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(distDir, 'LICENSE'));
    }

    console.log(`📤 发布 ${moduleConfig.packageName}...`);
    try {
        execSync('npm publish --access public', {
            cwd: distDir,
            stdio: 'inherit',
        });
        console.log(`✅ ${moduleConfig.packageName} 发布成功\n`);
        success++;
    } catch (error) {
        console.error(`❌ ${moduleConfig.packageName} 发布失败: ${error.message}\n`);
        failed++;
    }
}

console.log(`\n📊 发布完成: ${success} 成功, ${failed} 失败`);
