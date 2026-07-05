#!/bin/bash
set -euo pipefail

echo "=== 启动 QimenJS Demo ==="

# 1. 构建库
echo "-- 构建 QimenJS 库 --"
cd /workspaces/QimenJs
pnpm run build

# 2. 构建 i18n IIFE
echo "-- 构建 i18n --"
cd examples/full-stack/client
npx vite build --config vite.config.i18n.ts

# 3. 启动所有服务（后台）
echo "-- 启动服务 --"
cd ..
node scripts/start-all.js &

echo "=== 启动完成 ==="
echo "前端: http://localhost:5173"
echo "Auth Server: http://localhost:3000"
echo "ABP API: http://localhost:3001"
echo "Spring API: http://localhost:3002"
