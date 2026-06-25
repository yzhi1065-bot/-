# 中医智能诊断系统 - 前端界面

## 技术栈
- React 18 + TypeScript
- Ant Design 5
- Vite 构建
- Zustand 状态管理
- ECharts 数据可视化
- Axios HTTP 客户端

## 快速启动
```bash
npm install
npm run dev
```

## 页面路由
- `/login` - 登录页
- `/dashboard` - 工作台
- `/patients` - 患者列表
- `/patients/:id` - 患者详情
- `/diagnosis` - 四诊采集工作台
- `/diagnosis/:sessionId` - AI诊断页面
- `/prescription/:sessionId` - 处方管理
- `/devices` - 设备管理

## 项目结构
```
src/
├── components/    # 公共组件
├── pages/         # 页面组件
├── services/      # API 服务
├── store/         # 状态管理
├── styles/        # 全局样式
└── types/         # 类型定义
```
