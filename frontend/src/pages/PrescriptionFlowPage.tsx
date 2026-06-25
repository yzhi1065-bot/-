import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Descriptions, Spin, message } from 'antd'
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultPrescriptions = [
    { id: 1, no: 'RX20260001', patient: '张三', doctor: '张医生', date: '2026-06-23', herbs: '附子理中汤加减', amount: 156, status: 'signed' },
    { id: 2, no: 'RX20260002', patient: '李四', doctor: '张医生', date: '2026-06-22', herbs: '逍遥散加减', amount: 120, status: 'pending' },
    { id: 3, no: 'RX20260003', patient: '王五', doctor: '李医生', date: '2026-06-20', herbs: '六味地黄丸加减', amount: 180, status: 'audited' },
  ]

export default function PrescriptionFlowPage() {
  const [prescriptions, setPrescriptions] = useState(defaultPrescriptions)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 86, pendingSign: 3, pendingAudit: 5, monthlyAmount: 8650 })

  useEffect(() => {
    setLoading(true)
    request.get('/prescriptions/flow').then((res: any) => {
      const d = res.data || res
      if (d.list) setPrescriptions(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <FileTextOutlined /> 电子处方流转
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="处方总数" value={stats.total} suffix="张" /></Card></Col>
        <Col span={6}><Card><Statistic title="待签署" value={stats.pendingSign} suffix="张" valueStyle={{ color: '#E67E22' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待审核" value={stats.pendingAudit} suffix="张" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="本月金额" value={stats.monthlyAmount} prefix="¥" valueStyle={{ color: '#27AE60' }} /></Card></Col>
      </Row>

      <Card title="处方列表" extra={<Space><Button type="primary">签署处方</Button></Space>}>
        <Table dataSource={prescriptions} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '处方号', dataIndex: 'no', key: 'no' },
            { title: '患者', dataIndex: 'patient', key: 'patient' },
            { title: '医生', dataIndex: 'doctor', key: 'doctor' },
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '方剂', dataIndex: 'herbs', key: 'herbs', ellipsis: true },
            { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v}` },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
              const m: Record<string, { color: string; label: string }> = { signed: { color: 'green', label: '已签署' }, pending: { color: 'orange', label: '待签署' }, audited: { color: 'blue', label: '已审核' } }
              return <Tag color={m[v]?.color}>{m[v]?.label || v}</Tag>
            }},
            { title: '操作', key: 'action', render: (_: any, r: any) => <Space>
              <Button size="small" icon={<PrinterOutlined />}>打印</Button>
              {r.status === 'pending' && <Button size="small" type="primary">签署</Button>}
            </Space>},
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
