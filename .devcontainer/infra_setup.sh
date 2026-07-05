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
pnpm install

# 3. 安装示例依赖
echo "-- 安装示例依赖 --"
cd examples/full-stack
pnpm install

# 4. 构建库
echo "-- 构建 QimenJS 库 --"
cd /workspaces/QimenJs
pnpm run build
echo "-- 库构建完成 --"

# 5. 构建 i18n IIFE
echo "-- 构建 i18n --"
cd examples/full-stack/client
npx vite build --config vite.config.i18n.ts
echo "-- i18n构建完成 --"

# 6. 构建前端
echo "-- 构建前端 --"
npx vite build --outDir dist
echo "-- 前端构建完成 --"

echo "=== 初始化完成 ==="
