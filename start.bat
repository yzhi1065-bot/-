@echo off
cd /d "%~dp0"

chcp 65001 >nul

echo ╔════════════════════════════════════════╗
echo ║     中医智能诊断系统 - 一键启动        ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt >nul 2>&1
echo Starting backend (port 8000)...
start "TCM-Backend" cmd /c "python run.py & pause"
cd ..

echo [2/3] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
)
echo Starting frontend (port 3000)...
start "TCM-Frontend" cmd /c "npm run dev & pause"
cd ..

echo.
echo ╔════════════════════════════════════════╗
echo ║     Startup Complete!                   ║
echo ║                                        ║
echo ║  Frontend: http://localhost:3000        ║
echo ║  Backend:  http://localhost:8000        ║
echo ║  API Docs: http://localhost:8000/api/docs║
echo ║                                        ║
echo ║  Login: admin / admin123               ║
echo ╚════════════════════════════════════════╝
echo.
echo Press any key to exit this window...
echo (the two server windows will keep running)
pause >nul
