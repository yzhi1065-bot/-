import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Select, DatePicker, Timeline, Row, Col, Badge, Statistic, Spin, message } from 'antd'
import { SecurityScanOutlined, UserOutlined, MedicineBoxOutlined, LoginOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const defaultLogData = [
  { id: 1, time: '2026-06-23 09:15:23', user: 'admin', action: '登录系统', type: 'auth', ip: '192.168.1.100', detail: '管理员登录' },
  { id: 2, time: '2026-06-23 09:20:45', user: '张医生', action: '新建患者', type: 'patient', ip: '192.168.1.101', detail: '创建患者：张三' },
  { id: 3, time: '2026-06-23 09:25:12', user: '张医生', action: '创建诊断会话', type: 'diagnosis', ip: '192.168.1.101', detail: '会话ID: 8' },
  { id: 4, time: '2026-06-23 09:30:08', user: '张医生', action: '保存望诊数据', type: 'diagnosis', ip: '192.168.1.101', detail: '会话ID: 8' },
  { id: 5, time: '2026-06-23 09:35:33', user: '张医生', action: 'AI诊断', type: 'ai', ip: '192.168.1.101', detail: '结果：脾肾阳虚证' },
  { id: 6, time: '2026-06-23 09:38:19', user: '张医生', action: '签署诊断', type: 'ai', ip: '192.168.1.101', detail: '审核通过' },
  { id: 7, time: '2026-06-23 09:42:01', user: 'admin', action: '修改AI配置', type: 'config', ip: '192.168.1.100', detail: '切换为在线模式' },
  { id: 8, time: '2026-06-23 10:00:00', user: '张医生', action: '导出报告', type: 'export', ip: '192.168.1.101', detail: '导出诊断报告PDF' },
  { id: 9, time: '2026-06-22 16:30:15', user: '李医生', action: '登录系统', type: 'auth', ip: '192.168.1.102', detail: '医生登录' },
  { id: 10, time: '2026-06-22 16:45:22', user: '李医生', action: '查询患者', type: 'patient', ip: '192.168.1.102', detail: '搜索：王五' },
  { id: 11, time: '2026-06-22 14:20:10', user: 'admin', action: '注册设备', type: 'device', ip: '192.168.1.100', detail: '脉诊仪-001' },
  { id: 12, time: '2026-06-22 14:00:00', user: '系统', action: '数据备份', type: 'system', ip: 'localhost', detail: '每日全量备份完成' },
]

const actionTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  auth: { color: 'blue', icon: <LoginOutlined /> },
  patient: { color: 'green', icon: <UserOutlined /> },
  diagnosis: { color: 'orange', icon: <MedicineBoxOutlined /> },
  ai: { color: 'red', icon: <MedicineBoxOutlined /> },
  config: { color: 'purple', icon: <SecurityScanOutlined /> },
  export: { color: 'cyan', icon: <MedicineBoxOutlined /> },
  device: { color: 'geekblue', icon: <MedicineBoxOutlined /> },
  system: { color: 'default', icon: <SecurityScanOutlined /> },
}

export default function AuditLogPage() {
  const [logData, setLogData] = useState(defaultLogData)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    todayOps: defaultLogData.filter(l => l.time.startsWith('2026-06-23')).length,
    activeUsers: 3,
    aiCount: defaultLogData.filter(l => l.type === 'ai').length,
    exportCount: defaultLogData.filter(l => l.type === 'export').length,
  })

  useEffect(() => {
    setLoading(true)
    request.get('/audit-logs').then((res: any) => {
      const d = res.data || res
      if (d.logs) setLogData(d.logs)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const recentActions = logData.slice(0, 5)
  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SecurityScanOutlined /> 操作日志与审计
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="今日操作" value={logData.filter(l => l.time.startsWith('2026-06-23')).length} /></Card></Col>
        <Col span={6}><Card><Statistic title="活跃用户" value={stats.activeUsers} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="AI诊断次数" value={stats.aiCount} /></Card></Col>
        <Col span={6}><Card><Statistic title="数据导出" value={stats.exportCount} /></Card></Col>
      </Row>
      </Spin>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="实时操作" size="small" style={{ marginBottom: 16 }}>
            <Timeline items={recentActions.map(a => ({
              color: actionTypeConfig[a.type]?.color || 'gray',
              children: (
                <div>
                  <Tag color={actionTypeConfig[a.type]?.color} style={{ fontSize: 11 }}>{a.action}</Tag>
                  <Text style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>{a.time}</Text>
                  <div style={{ fontSize: 12, marginTop: 2 }}>{a.user} - {a.detail}</div>
                </div>
              ),
            }))} />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="日志详情" extra={
            <Space>
              <Select defaultValue="" style={{ width: 120 }}>
                <Select.Option value="">全部类型</Select.Option>
                <Select.Option value="auth">认证</Select.Option>
                <Select.Option value="patient">患者</Select.Option>
                <Select.Option value="diagnosis">诊断</Select.Option>
                <Select.Option value="ai">AI</Select.Option>
                <Select.Option value="config">配置</Select.Option>
              </Select>
              <RangePicker size="small" />
            </Space>
          }>
            <Table dataSource={logData} rowKey="id" pagination={{ pageSize: 10 }} size="small"
              columns={[
                { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
                { title: '用户', dataIndex: 'user', key: 'user', width: 80 },
                { title: '操作', dataIndex: 'action', key: 'action', render: (v: string, r: any) => (
                  <Tag color={actionTypeConfig[r.type]?.color}>{v}</Tag>
                )},
                { title: '详情', dataIndex: 'detail', key: 'detail', ellipsis: true },
                { title: 'IP', dataIndex: 'ip', key: 'ip', width: 130 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
