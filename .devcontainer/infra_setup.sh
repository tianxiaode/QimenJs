#!/bin/bash
set -euo pipefail

echo "=== 初始化 QimenJS Demo ==="

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

echo "=== 初始化完成 ==="
