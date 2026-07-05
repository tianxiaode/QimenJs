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

# 7. 启动后端服务
echo "-- 启动后端服务 --"
cd /workspaces/QimenJs/examples/full-stack
nohup node servers/auth-server/index.js > /tmp/auth-server.log 2>&1 &
echo "Auth Server (PID: $!)"
nohup node servers/abp-api/index.js > /tmp/abp-api.log 2>&1 &
echo "ABP API (PID: $!)"
nohup node servers/spring-api/index.js > /tmp/spring-api.log 2>&1 &
echo "Spring API (PID: $!)"
sleep 2

# 8. 启动 Nginx（直接指定配置文件，不依赖 sites-available 结构）
echo "-- 启动 Nginx --"
sudo nginx -c /workspaces/QimenJs/.devcontainer/nginx.conf
echo "-- Nginx 启动完成 --"

echo "=== 初始化完成 ==="
echo "访问地址: http://localhost:80"
