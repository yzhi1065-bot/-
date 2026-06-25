import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Rate, Timeline, Spin, message } from 'antd'
import { PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined, SmileOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultFollowups = [
    { id: 1, patient: '张三', date: '2026-06-23', doctor: '张医生', diagnosis: '脾肾阳虚证', method: '电话', status: 'done', effect: '显效', satisfaction: 5, note: '畏寒明显改善，建议继续服药' },
    { id: 2, patient: '李四', date: '2026-06-20', doctor: '张医生', diagnosis: '肝郁脾虚证', method: '微信', status: 'done', effect: '有效', satisfaction: 4, note: '情绪改善，仍有胁痛' },
    { id: 3, patient: '王五', date: '2026-06-18', doctor: '李医生', diagnosis: '痰湿内阻证', method: '门诊', status: 'done', effect: '有效', satisfaction: 5, note: '体重减轻2kg' },
    { id: 4, patient: '赵六', date: '2026-06-15', doctor: '张医生', diagnosis: '阴虚火旺证', method: '电话', status: 'pending', effect: '', satisfaction: 0, note: '待回访' },
  ]

export default function FollowupPage2() {
  const [followups, setFollowups] = useState(defaultFollowups)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ pending: 5, monthly: 12, satisfaction: 4.6, effectiveRate: 92 })

  useEffect(() => {
    setLoading(true)
    request.get('/api/followups').then((res: any) => {
      const d = res.data || res
      if (d.list) setFollowups(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <PhoneOutlined /> 患者随访管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="需随访" value={stats.pending} suffix="人" valueStyle={{ color: '#E67E22' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="本月随访" value={stats.monthly} suffix="人次" /></Card></Col>
        <Col span={6}><Card><Statistic title="满意度" value={stats.satisfaction} prefix={<SmileOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="有效率" value={stats.effectiveRate} suffix="%" valueStyle={{ color: '#27AE60' }} /></Card></Col>
      </Row>

      <Card title="随访记录" extra={<Button type="primary" icon={<PhoneOutlined />}>新建随访</Button>}>
        <Table dataSource={followups} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '患者', dataIndex: 'patient', key: 'patient' },
            { title: '随访日期', dataIndex: 'date', key: 'date' },
            { title: '医生', dataIndex: 'doctor', key: 'doctor' },
            { title: '诊断', dataIndex: 'diagnosis', key: 'diagnosis', render: (v: string) => <Tag color="red">{v}</Tag> },
            { title: '方式', dataIndex: 'method', key: 'method', render: (v: string) => <Tag>{v}</Tag> },
            { title: '疗效', dataIndex: 'effect', key: 'effect', render: (v: string) => {
              if (!v) return '-'
              return <Tag color={v === '显效' ? 'green' : v === '有效' ? 'blue' : 'orange'}>{v}</Tag>
            }},
            { title: '满意度', dataIndex: 'satisfaction', key: 'sat', render: (v: number) => v ? <Rate disabled value={v} style={{ fontSize: 14 }} /> : '-' },
            { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
              <Tag color={v === 'done' ? 'green' : 'orange'}>{v === 'done' ? '已完成' : '待回访'}</Tag>
            )},
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
