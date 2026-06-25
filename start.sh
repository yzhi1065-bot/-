#!/bin/bash

echo "============================================"
echo "  中医智能诊断系统 - 一键启动脚本"
echo "============================================"
echo ""

# 后端服务
echo "[1/3] 启动后端服务..."
cd backend
pip3 install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt
python3 run.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 前端服务
echo "[2/3] 启动前端服务..."
cd frontend
npm install 2>/dev/null
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  启动完成！"
echo ""
echo "  前端界面: http://localhost:3000"
echo "  后端API:  http://localhost:8000"
echo "  API文档:  http://localhost:8000/api/docs"
echo ""
echo "  默认登录：admin / admin123"
echo "============================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
