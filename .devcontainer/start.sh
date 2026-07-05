#!/bin/bash

echo "=== 启动 QimenJS Demo ==="

cd /workspaces/QimenJs/examples/full-stack

# 启动所有服务（后台）
nohup node scripts/start-all.js > /tmp/qimenjs-servers.log 2>&1 &
disown

echo "=== 启动完成 ==="
echo "前端: http://localhost:5173"
echo "Auth Server: http://localhost:3000"
echo "ABP API: http://localhost:3001"
echo "Spring API: http://localhost:3002"
echo "服务日志: /tmp/qimenjs-servers.log"
