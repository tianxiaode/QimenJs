#!/bin/bash

echo "=== 初始化 QimenJS Demo ==="

# 0. 安装 Nginx
echo "-- 安装 Nginx --"
sudo apt-get update -qq
sudo apt-get install -y -qq nginx

# 1. 安装 pnpm
echo "-- 安装 pnpm --"
npm install -g pnpm@9

# 2. 安装根项目依赖
echo "-- 安装项目依赖 --"
cd /workspaces/QimenJs
pnpm install

# 3. 构建库（包含 i18n IIFE）
echo "-- 构建 QimenJS 库 --"
pnpm run build
echo "-- 库构建完成 --"

# 4. 链接本地包到示例项目
echo "-- 链接本地包 --"
node scripts/link-packages.js

# 5. 复制 i18n IIFE 到 public 目录
echo "-- 复制 i18n IIFE --"
cd /workspaces/QimenJs/examples/full-stack/client
npx qimen-i18n-copy

# 6. 构建前端
echo "-- 构建前端 --"
npx vite build --outDir dist
echo "-- 前端构建完成 --"

echo "=== 初始化完成 ==="
