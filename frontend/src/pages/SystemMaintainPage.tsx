import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Button, Progress, Descriptions, Divider, Alert, Spin, message } from 'antd'
import { CloudServerOutlined, DatabaseOutlined, HddOutlined, SafetyOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultLogs = [
  { time: '2026-06-23 10:00', level: 'info', msg: '系统备份任务已完成' },
  { time: '2026-06-23 09:30', level: 'info', msg: '用户 admin 登录系统' },
  { time: '2026-06-23 09:00', level: 'info', msg: '数据库自动清理完成' },
  { time: '2026-06-22 02:00', level: 'info', msg: '系统备份任务已完成' },
]

const defaultBackups = [
  { name: 'backup_20260623.db', size: '12.5MB', date: '2026-06-23 02:00' },
  { name: 'backup_20260622.db', size: '12.3MB', date: '2026-06-22 02:00' },
  { name: 'backup_20260621.db', size: '12.1MB', date: '2026-06-21 02:00' },
]

export default function SystemMaintainPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ uptime: 72, dbSize: '12.5', apiRequests: 1284, version: 'v1.0.0' })
  const [logs, setLogs] = useState(defaultLogs)
  const [backups, setBackups] = useState(defaultBackups)

  useEffect(() => {
    setLoading(true)
    request.get('/admin/maintenance').then((res: any) => {
      const d = res.data || res
      if (d.stats) setStats(d.stats)
      if (d.logs) setLogs(d.logs)
      if (d.backups) setBackups(d.backups)
    }).catch(() => {
      // 使用默认数据
    }).finally(() => setLoading(false))
  }, [])

  const handleBackup = async () => {
    try {
      await request.post('/admin/maintenance/backup')
      message.success('备份成功')
    } catch {
      message.error('备份失败')
    }
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <CloudServerOutlined /> 系统维护
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="运行时间" value={stats.uptime} suffix="小时" prefix={<HddOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="数据库大小" value={stats.dbSize} suffix="MB" prefix={<DatabaseOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="API请求" value={stats.apiRequests} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="系统版本" value={stats.version} prefix={<SafetyOutlined />} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="系统状态" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="后端服务"><Tag color="green">运行中</Tag></Descriptions.Item>
              <Descriptions.Item label="数据库连接"><Tag color="green">正常</Tag></Descriptions.Item>
              <Descriptions.Item label="AI服务"><Tag color="orange">演示模式</Tag></Descriptions.Item>
              <Descriptions.Item label="磁盘使用"><Progress percent={35} size="small" /></Descriptions.Item>
              <Descriptions.Item label="内存使用"><Progress percent={42} size="small" /></Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="系统日志" style={{ marginBottom: 16 }}>
            <Table dataSource={logs} rowKey="time" pagination={false} size="small"
              columns={[
                { title: '时间', dataIndex: 'time', key: 'time' },
                { title: '级别', dataIndex: 'level', key: 'level', render: (v: string) => <Tag color="blue">{v}</Tag> },
                { title: '内容', dataIndex: 'msg', key: 'msg' },
              ]} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="数据备份" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert message="系统每天 2:00 自动备份数据库" type="info" showIcon />
              <Divider />
              <Button type="primary" icon={<DownloadOutlined />} block onClick={handleBackup}>立即创建备份</Button>
              <Button icon={<ReloadOutlined />} block>恢复数据</Button>
              <Divider />
              <Table dataSource={backups} rowKey="name" pagination={false} size="small"
                columns={[
                  { title: '文件名', dataIndex: 'name', key: 'name' },
                  { title: '大小', dataIndex: 'size', key: 'size' },
                  { title: '日期', dataIndex: 'date', key: 'date' },
                  { title: '操作', key: 'action', render: () => <Button size="small">还原</Button> },
                ]} />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
