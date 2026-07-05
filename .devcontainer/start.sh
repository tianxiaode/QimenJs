#!/bin/bash

echo "=== 启动 QimenJS Demo ==="

cd /workspaces/QimenJs/examples/full-stack

# 启动后端服务
nohup node servers/auth-server/index.js > /tmp/auth-server.log 2>&1 &
echo "Auth Server 启动 (PID: $!)"

nohup node servers/abp-api/index.js > /tmp/abp-api.log 2>&1 &
echo "ABP API 启动 (PID: $!)"

nohup node servers/spring-api/index.js > /tmp/spring-api.log 2>&1 &
echo "Spring API 启动 (PID: $!)"

# 等待后端启动
sleep 2

# 构建前端
echo "-- 构建前端 --"
cd client
npx vite build --outDir dist || { echo "前端构建失败"; exit 1; }

# 配置并启动 Nginx
echo "-- 启动 Nginx --"
sudo cp /workspaces/QimenJs/.devcontainer/nginx.conf /etc/nginx/sites-available/default
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx || { echo "Nginx 启动失败"; exit 1; }

echo "=== 启动完成 ==="
echo "访问地址: http://localhost:80"
