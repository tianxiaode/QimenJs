#!/bin/bash

echo "=== 启动 QimenJS Demo ==="

# 停止旧服务
sudo nginx -s stop 2>/dev/null || true
pkill -f "node servers/" 2>/dev/null || true
sleep 1

cd /workspaces/QimenJs/examples/full-stack

# 启动后端服务（用 setsid 创建新会话，确保进程不被清理）
setsid node servers/auth-server/index.js > /tmp/auth-server.log 2>&1 &
echo "Auth Server (PID: $!)"
setsid node servers/abp-api/index.js > /tmp/abp-api.log 2>&1 &
echo "ABP API (PID: $!)"
setsid node servers/spring-api/index.js > /tmp/spring-api.log 2>&1 &
echo "Spring API (PID: $!)"

# 等待后端启动
sleep 3

# 验证后端是否在运行
if curl -s http://localhost:3000/userinfo > /dev/null 2>&1; then
    echo "Auth Server: OK"
else
    echo "Auth Server: 未响应，检查日志: /tmp/auth-server.log"
fi

if curl -s http://localhost:3001/api/app/user > /dev/null 2>&1; then
    echo "ABP API: OK"
else
    echo "ABP API: 未响应，检查日志: /tmp/abp-api.log"
fi

if curl -s http://localhost:3002/api/orders > /dev/null 2>&1; then
    echo "Spring API: OK"
else
    echo "Spring API: 未响应，检查日志: /tmp/spring-api.log"
fi

# 启动 Nginx
sudo nginx -c /workspaces/QimenJs/.devcontainer/nginx.conf

echo "=== 启动完成 ==="
echo "访问地址: http://localhost:80"
