import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Select, Spin, message } from 'antd'
import { MedicineBoxOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultRecords = [
    { id: 1, date: '2026-06-23', patient: '张三', category: '中药', total: 156, insurance: 78, self: 78, ratio: '50%', status: 'settled' },
    { id: 2, date: '2026-06-22', patient: '李四', category: '针灸', total: 80, insurance: 56, self: 24, ratio: '70%', status: 'settled' },
    { id: 3, date: '2026-06-20', patient: '王五', category: '检查', total: 200, insurance: 140, self: 60, ratio: '70%', status: 'pending' },
  ]

export default function InsurancePage() {
  const [records, setRecords] = useState(defaultRecords)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ monthlyCount: 28, insuranceAmount: 8650, selfAmount: 4230, ratio: 67 })

  useEffect(() => {
    setLoading(true)
    request.get('/insurance/records').then((res: any) => {
      const d = res.data || res
      if (d.list) setRecords(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <MedicineBoxOutlined /> 医保结算管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="本月结算" value={stats.monthlyCount} suffix="笔" /></Card></Col>
        <Col span={6}><Card><Statistic title="医保金额" value={stats.insuranceAmount} prefix="¥" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="自费金额" value={stats.selfAmount} prefix="¥" /></Card></Col>
        <Col span={6}><Card><Statistic title="报销比例" value={stats.ratio} suffix="%" valueStyle={{ color: '#27AE60' }} /></Card></Col>
      </Row>

      <Card title="结算记录" extra={<Space><Select defaultValue="" style={{ width: 120 }}><Select.Option value="">全部类型</Select.Option><Select.Option value="中药">中药</Select.Option><Select.Option value="针灸">针灸</Select.Option><Select.Option value="检查">检查</Select.Option></Select><Button type="primary">医保结算</Button></Space>}>
        <Table dataSource={records} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '患者', dataIndex: 'patient', key: 'patient' },
            { title: '类别', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '总金额', dataIndex: 'total', key: 'total', render: (v: number) => `¥${v}` },
            { title: '医保支付', dataIndex: 'insurance', key: 'insurance', render: (v: number) => <Text style={{ color: '#5B8DEF' }}>¥{v}</Text> },
            { title: '自付', dataIndex: 'self', key: 'self', render: (v: number) => <Text style={{ color: '#C0392B' }}>¥{v}</Text> },
            { title: '报销比例', dataIndex: 'ratio', key: 'ratio' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'settled' ? 'green' : 'orange'}>{v === 'settled' ? '已结算' : '待处理'}</Tag> },
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
