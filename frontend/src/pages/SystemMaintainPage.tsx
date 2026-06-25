import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Button, Progress, Descriptions, Divider, Alert, Spin, message } from 'antd'
import { CloudServerOutlined, DatabaseOutlined, HddOutlined, SafetyOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultLogs = [
  { time: '2026-06-23 10:00', level: 'info', msg: '??????' },
  { time: '2026-06-23 09:30', level: 'info', msg: '?? admin ??' },
  { time: '2026-06-23 09:00', level: 'info', msg: '????' },
  { time: '2026-06-22 02:00', level: 'info', msg: '??????' },
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
      message.error('???????????????')
    }).finally(() => setLoading(false))
  }, [])

  const handleBackup = async () => {
    try {
      await request.post('/admin/maintenance/backup')
      message.success('????')
    } catch {
      message.error('????')
    }
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <CloudServerOutlined /> ????
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="??????" value={stats.uptime} suffix="??" prefix={<HddOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="?????" value={stats.dbSize} suffix="MB" prefix={<DatabaseOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="API???" value={stats.apiRequests} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="????" value={stats.version} prefix={<SafetyOutlined />} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="????" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="????"><Tag color="green">???</Tag></Descriptions.Item>
              <Descriptions.Item label="?????"><Tag color="green">??</Tag></Descriptions.Item>
              <Descriptions.Item label="AI??"><Tag color="orange">????</Tag></Descriptions.Item>
              <Descriptions.Item label="????"><Progress percent={35} size="small" /></Descriptions.Item>
              <Descriptions.Item label="????"><Progress percent={42} size="small" /></Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="????" style={{ marginBottom: 16 }}>
            <Table dataSource={logs} rowKey="time" pagination={false} size="small"
              columns={[
                { title: '??', dataIndex: 'time', key: 'time' },
                { title: '??', dataIndex: 'level', key: 'level', render: (v: string) => <Tag color="blue">{v}</Tag> },
                { title: '??', dataIndex: 'msg', key: 'msg' },
              ]} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="????" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert message="????2:00????" type="info" showIcon />
              <Divider />
              <Button type="primary" icon={<DownloadOutlined />} block onClick={handleBackup}>???????</Button>
              <Button icon={<ReloadOutlined />} block>?????</Button>
              <Divider />
              <Table dataSource={backups} rowKey="name" pagination={false} size="small"
                columns={[
                  { title: '????', dataIndex: 'name', key: 'name' },
                  { title: '??', dataIndex: 'size', key: 'size' },
                  { title: '??', dataIndex: 'date', key: 'date' },
                  { title: '??', key: 'action', render: () => <Button size="small">??</Button> },
                ]} />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
