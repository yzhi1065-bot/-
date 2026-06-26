# 中医智能诊断系统 — 诊所上线执行方案

## 总目标
30天内从开发原型变为可稳定运行的诊所系统

## 架构
三路并行：我（Hermes）总控调度，Claude Code 干后端，Codex 干前端
每阶段结束后三方互检

---

## Phase 1：地基（3天）
目标：系统能安全稳定运行

### P1-A 安全加固（Claude Code）
- [ ] security.py: SHA256 → bcrypt
- [ ] 修改默认 SECRET_KEY 为环境变量读取
- [ ] config.py: 默认值不包含敏感信息
- [ ] patient.py: 身份证号 AES-256 列级加密
- [ ] main.py: CORS 改为配置文件控制

### P1-B 数据库升级（Claude Code）
- [ ] 创建 Alembic 迁移配置
- [ ] 编写 PostgreSQL 兼容迁移脚本
- [ ] 配置 docker-compose 的 PostgreSQL 连接
- [ ] 验证 SQLite→PostgreSQL 数据迁移

### P1-C 自动备份（Claude Code）
- [ ] backup.py: 每日自动备份脚本（pg_dump/sqlite两种模式）
- [ ] 保留7天备份，自动清理旧备份

### P1-D Docker 验证（我）
- [ ] 修复 nginx.conf（HTTPS、gzip、安全头）
- [ ] docker compose build 测试通过
- [ ] docker compose up 前后端正常

### P1-E 前端基建（Codex）
- [ ] 路由懒加载（React.lazy + Suspense）
- [ ] 所有页面统一 try/catch 错误提示
- [ ] 新增全局状态管理（zustand store扩展）

---

## Phase 2：核心闭环（5天）
目标：患者到店→挂号→看病→开方→收费→取药 全流程跑通

### P2-A 收银结算模块（Claude Code + Codex）
- [ ] 后端: 收费模型 + API（Charging, Payment, Invoice）
- [ ] 后端: 处方自动计价（从处方药品计算总价）
- [ ] 前端: 收费结算台页面 ChargingPage.tsx
- [ ] 前端: 日结统计

### P2-B 处方流转（Claude Code + Codex）
- [ ] 后端: 处方状态机（draft→pending_audit→approved→paid→dispensed）
- [ ] 后端: 药师审核 API
- [ ] 前端: 药师审核工作台
- [ ] 前端: 处方流转状态追踪

### P2-C 接诊工作台重构（Codex）
- [ ] 三栏布局: 左侧患者信息 / 中间诊断 / 右侧处方预览
- [ ] 四诊采集改为 Tab 式自由切换
- [ ] 处方编辑器: 左侧药材目录 → 拖拽添加到处方
- [ ] AI诊断结果支持手动微调
- [ ] 表单sessionStorage草稿自动保存

### P2-D 收费+取药联动（我）
- [ ] 收费后自动更新处方状态
- [ ] 收费后自动扣减药房库存
- [ ] 排队管理联动收费状态

---

## Phase 3：体验完善（3天）
目标：医生用得顺手，患者找得到门

### P3-A 患者端（Codex）
- [ ] 手机号验证码登录
- [ ] 在线预约
- [ ] 查看历史诊断报告
- [ ] 填写预问诊问卷

### P3-B 30+ Mock 页面修复（Claude Code）
- [ ] 逐个检查 fallback_api 路由
- [ ] 需要的加真实模型+API
- [ ] 不需要的保留示例数据

### P3-C 审计日志（Claude Code）
- [ ] AuditLog 模型 + 自动记录中间件
- [ ] 审计日志查询 API
- [ ] 审计日志前端页面

### P3-D 病历打印（Codex）
- [ ] 诊断报告打印模板
- [ ] 处方打印模板
- [ ] 浏览器 window.print() 优化

---

## 验收标准
- [ ] 密码 bcrypt、ID加密、CORS受限 → 安全
- [ ] PostgreSQL 运行，数据自动备份 → 稳定
- [ ] 挂号→看病→开方→收费→取药能在10分钟内完成 → 高效
- [ ] 所有页面不白屏、不报500 → 可靠
- [ ] 测试 156+ 全部通过 → 可维护
