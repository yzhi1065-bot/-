import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Progress, Spin, message } from 'antd'
import { LaptopOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, ToolOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultEquipment = [
    { id: 1, name: '脉诊仪-001', type: '脉诊仪', model: 'MZ-2000', location: '诊室1', status: 'normal', last_maintain: '2026-06-01', next_maintain: '2026-09-01' },
    { id: 2, name: '舌诊仪-001', type: '舌诊仪', model: 'SZ-100', location: '诊室1', status: 'normal', last_maintain: '2026-05-15', next_maintain: '2026-08-15' },
    { id: 3, name: '针灸电疗仪-001', type: '治疗设备', model: 'DL-500', location: '治疗室', status: 'warning', last_maintain: '2026-03-01', next_maintain: '2026-06-01' },
    { id: 4, name: '中药煎药机-001', type: '煎药设备', model: 'JY-300', location: '药房', status: 'normal', last_maintain: '2026-04-20', next_maintain: '2026-07-20' },
    { id: 5, name: '电脑-001', type: '办公设备', model: '联想', location: '诊室2', status: 'repair', last_maintain: '2026-02-10', next_maintain: '-' },
  ]

export default function EquipmentManagePage() {
  const [equipment, setEquipment] = useState(defaultEquipment)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 15, normal: 12, maintenance: 2, repair: 1 })

  useEffect(() => {
    setLoading(true)
    request.get('/equipment').then((res: any) => {
      const d = res.data || res
      if (d.list) setEquipment(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <LaptopOutlined /> 设备资产管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="设备总数" value={15} suffix="台" /></Card></Col>
        <Col span={6}><Card><Statistic title="正常运行" value={12} suffix="台" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="保养到期" value={2} suffix="台" valueStyle={{ color: '#E67E22' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待维修" value={1} suffix="台" valueStyle={{ color: '#C0392B' }} /></Card></Col>
      </Row>

      <Card title="设备清单" extra={<Space><Button>保养提醒</Button><Button type="primary">添加设备</Button></Space>}>
        <Table dataSource={equipment} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '设备名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '型号', dataIndex: 'model', key: 'model' },
            { title: '位置', dataIndex: 'location', key: 'location' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
              const m: Record<string, any> = { normal: { color: 'green', label: '正常' }, warning: { color: 'orange', label: '保养到期' }, repair: { color: 'red', label: '维修中' } }
              return <Tag color={m[v]?.color}>{m[v]?.label || v}</Tag>
            }},
            { title: '上次保养', dataIndex: 'last_maintain', key: 'last' },
            { title: '下次保养', dataIndex: 'next_maintain', key: 'next' },
            { title: '操作', key: 'action', render: () => <Space><Button size="small">保养</Button><Button size="small">维修</Button></Space> },
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
