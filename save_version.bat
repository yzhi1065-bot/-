@echo off
cd /d "%~dp0"

echo Initializing git repository...
git init
git add -A
git commit -m "init: 中医智能诊断系统 v1.0

- 后端 FastAPI, 前端 React+AntD, 桌面 Electron
- 四诊采集 + AI诊断 + 处方管理 + 设备管理
- 数据统计 + AI配置 + 预问诊 + 体质辨识
- Docker部署配置"

echo.
echo Done! Version saved.
echo To push to remote: git remote add origin <url> ^&^& git push -u origin master
pause
