#!/bin/bash

echo "=== 重新启动 QimenJS Demo ==="

# 停止旧服务
sudo nginx -s stop 2>/dev/null || true
pkill -f "node servers/" 2>/dev/null || true
sleep 1

cd /workspaces/QimenJs/examples/full-stack

# 启动后端服务
nohup node servers/auth-server/index.js > /tmp/auth-server.log 2>&1 &
nohup node servers/abp-api/index.js > /tmp/abp-api.log 2>&1 &
nohup node servers/spring-api/index.js > /tmp/spring-api.log 2>&1 &
sleep 2

# 启动 Nginx
sudo nginx -c /workspaces/QimenJs/.devcontainer/nginx.conf
echo "=== 启动完成 ==="
echo "访问地址: http://localhost:80"
