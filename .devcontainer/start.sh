#!/bin/bash

echo "=== 启动 QimenJS Demo ==="

# 1. 构建库
echo "-- 构建 QimenJS 库 --"
cd /workspaces/QimenJs
pnpm run build || { echo "构建失败"; exit 1; }
echo "-- 库构建完成 --"

# 2. 构建 i18n IIFE
echo "-- 构建 i18n --"
cd examples/full-stack/client
npx vite build --config vite.config.i18n.ts || { echo "i18n构建失败"; exit 1; }
echo "-- i18n构建完成 --"

# 3. 启动所有服务（后台，nohup 确保不阻塞）
echo "-- 启动服务 --"
cd ..
nohup node scripts/start-all.js > /tmp/qimenjs-servers.log 2>&1 &
disown

echo "=== 启动完成 ==="
echo "前端: http://localhost:5173"
echo "Auth Server: http://localhost:3000"
echo "ABP API: http://localhost:3001"
echo "Spring API: http://localhost:3002"
echo "服务日志: /tmp/qimenjs-servers.log"
