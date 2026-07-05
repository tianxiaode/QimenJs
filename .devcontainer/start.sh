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

# 启动前端开发服务器（需要在 client 目录下执行）
cd client
nohup npx vite --host 0.0.0.0 --port 5173 > /tmp/vite.log 2>&1 &
echo "Frontend 启动 (PID: $!)"

echo "=== 启动完成 ==="
echo "前端: http://localhost:5173"
echo "Auth Server: http://localhost:3000"
echo "ABP API: http://localhost:3001"
echo "Spring API: http://localhost:3002"
