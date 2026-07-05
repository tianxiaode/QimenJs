#!/bin/bash
set -euo pipefail

echo "=== 初始化 QimenJS Demo ==="

# 1. 安装 pnpm
echo "-- 安装 pnpm --"
npm install -g pnpm@9

# 2. 安装根项目依赖
echo "-- 安装项目依赖 --"
pnpm install

# 3. 构建库
echo "-- 构建 QimenJS 库 --"
pnpm run build

# 4. 安装示例依赖
echo "-- 安装示例依赖 --"
cd examples/full-stack
pnpm install

# 5. 构建 i18n IIFE
echo "-- 构建 i18n --"
cd client
npx vite build --config vite.config.i18n.ts

# 6. 启动所有服务（后台）
echo "-- 启动服务 --"
cd ..
node scripts/start-all.js &

echo "=== 初始化完成 ==="
echo "前端: http://localhost:5173"
echo "Auth Server: http://localhost:3000"
echo "ABP API: http://localhost:3001"
echo "Spring API: http://localhost:3002"
