# 中医智能诊断系统部署文档

## 环境要求
- Python 3.11+
- Node.js 18+
- Docker（可选，用于容器化部署）

## 开发环境启动

### Windows
```bash
# 一键启动
双击 start.bat

# 或手动启动
cd backend
pip install -r requirements.txt
python run.py

# 新终端
cd frontend
npm install
npm run dev
```

### Mac / Linux
```bash
# 一键启动
chmod +x start.sh
./start.sh
```

访问 http://localhost:3000
默认账号: admin / admin123

## 生产环境部署（Docker）

```bash
# 1. 构建前端
cd frontend
npm install
npm run build

# 2. 使用Docker Compose启动
docker-compose up -d
```

### 环境变量配置
| 变量 | 说明 | 默认值 |
|------|------|--------|
| DATABASE_URL | 数据库连接 | sqlite:///./tcm.db |
| REDIS_URL | Redis连接 | (可选) |
| AI_API_URL | AI服务地址 | http://localhost:8010 |
| AI_API_KEY | AI API密钥 | (需配置) |
| SECRET_KEY | JWT密钥 | 生产环境请修改 |

## 目录结构
```
backend/     - FastAPI后端服务 (端口8000)
frontend/    - React前端应用 (端口3000)
desktop/     - Electron桌面采集端
ai-service/  - AI诊断服务模块
docs/        - 文档
docker-compose.yml - Docker编排
nginx.conf    - Nginx配置模板
```
