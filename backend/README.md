# 中医智能诊断系统 - 后端服务

## 技术栈
- FastAPI + SQLAlchemy + PostgreSQL
- Redis 缓存
- JWT 认证

## 快速启动
```bash
pip install -r requirements.txt
python run.py
```

## 项目结构
```
app/
├── api/          # API 路由
│   ├── patients.py    # 患者管理
│   ├── diagnosis.py   # 四诊采集
│   ├── ai_diagnosis.py # AI诊断
│   └── prescriptions.py # 处方管理
├── models/       # SQLAlchemy 数据模型
├── schemas/      # Pydantic 数据校验
├── services/     # 业务逻辑层
├── core/         # 核心配置(数据库/认证/安全)
└── main.py       # 入口文件
```
