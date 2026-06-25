@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ╔════════════════════════════════════════╗
echo ║    推送代码到 GitHub                   ║
echo ╚════════════════════════════════════════╝
echo.

set /p REPO_URL="请输入你的仓库地址 (例如 https://github.com/yzhi1065-bot/tcm-system.git): "

echo.
echo [1/5] 初始化 Git...
git init

echo [2/5] 添加所有文件...
git add -A

echo [3/5] 创建版本快照...
git commit -m "init: 中医智能诊断系统 v1.0

- 后端 FastAPI, 前端 React+AntD, 桌面 Electron
- 四诊采集 + AI诊断 + 处方管理 + 设备管理
- 数据统计 + AI配置 + 预问诊 + 体质辨识
- Docker + 设计文档"

echo [4/5] 连接到远程仓库...
git remote add origin %REPO_URL%

echo [5/5] 推送代码...
git branch -M main
git push -u origin main

echo.
echo ╔════════════════════════════════════════╗
echo ║    推送完成！                           ║
echo ╚════════════════════════════════════════╝
pause
