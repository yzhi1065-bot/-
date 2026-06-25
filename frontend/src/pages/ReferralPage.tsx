import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Descriptions, Modal, Form, Input, Select, message, Spin } from 'antd'
import { SwapRightOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultReferrals = [
    { id: 1, date: '2026-06-23', patient: '张三', from: '中医内科', to: '针灸科', reason: '腰痛需针灸治疗', doctor: '张医生', status: 'completed' },
    { id: 2, date: '2026-06-22', patient: '李四', from: '中医内科', to: '推拿科', reason: '颈椎病需推拿', doctor: '张医生', status: 'ongoing' },
    { id: 3, date: '2026-06-20', patient: '王五', from: '针灸科', to: '中医内科', reason: '需中药调理', doctor: '王医生', status: 'pending' },
  ]

export default function ReferralPage() {
  const [referrals, setReferrals] = useState(defaultReferrals)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ monthly: 8, completed: 5, ongoing: 2, pending: 1 })

  useEffect(() => {
    setLoading(true)
    request.get('/referrals').then((res: any) => {
      const d = res.data || res
      if (d.list) setReferrals(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SwapRightOutlined /> 转诊管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="本月转诊" value={stats.monthly} suffix="次" /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} suffix="次" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={stats.ongoing} suffix="次" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待接收" value={stats.pending} suffix="次" valueStyle={{ color: '#E67E22' }} /></Card></Col>
      </Row>

      <Card title="转诊记录" extra={<Button type="primary" icon={<PlusOutlined />}>发起转诊</Button>}>
        <Table dataSource={referrals} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '患者', dataIndex: 'patient', key: 'patient' },
            { title: '转出科室', dataIndex: 'from', key: 'from', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '转入科室', dataIndex: 'to', key: 'to', render: (v: string) => <Tag color="green">{v}</Tag> },
            { title: '转诊原因', dataIndex: 'reason', key: 'reason', ellipsis: true },
            { title: '医生', dataIndex: 'doctor', key: 'doctor' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
              const m: Record<string, { color: string; label: string }> = { completed: { color: 'green', label: '已完成' }, ongoing: { color: 'blue', label: '进行中' }, pending: { color: 'orange', label: '待接收' } }
              return <Tag color={m[v]?.color}>{m[v]?.label || v}</Tag>
            }},
            { title: '操作', key: 'action', render: (_: any, r: any) => <Space>{r.status === 'pending' && <Button size="small" type="primary">接收</Button>}<Button size="small">详情</Button></Space> },
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
