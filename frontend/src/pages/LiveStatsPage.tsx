import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Table, Statistic, Tag, DatePicker, Space, Progress } from 'antd'
import { TeamOutlined, MedicineBoxOutlined, RiseOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function LiveStatsPage() {
  const [dashboardStats, setDashboardStats] = useState<any>({})
  const [patterns, setPatterns] = useState<any[]>([])
  const [topHerbs, setTopHerbs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [dashRes, patRes, herbRes] = await Promise.all([
        request.get('/api/stats/dashboard').catch(() => ({ data: {} })),
        request.get('/api/stats/patterns').catch(() => ({ data: [] })),
        request.get('/api/stats/top-herbs').catch(() => ({ data: [] })),
      ])
      setDashboardStats((dashRes as any)?.data || {})
      setPatterns((patRes as any)?.data || [])
      setTopHerbs((herbRes as any)?.data || [])
    } catch (e) { /* ignore */ }
    setLoading(false)
  }

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <RiseOutlined /> 实时数据看板
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="总患者数" value={dashboardStats.total_patients || 0} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="今日就诊" value={dashboardStats.today_patients || 0} prefix={<MedicineBoxOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待审报告" value={dashboardStats.pending_reviews || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#E67E22' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="总就诊" value={dashboardStats.total_sessions || 0} prefix={<RiseOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="证型分布（真实数据）">
            {patterns.length === 0 ? (
              <Text type="secondary">暂无诊断数据</Text>
            ) : (
              <Table dataSource={patterns} rowKey="pattern" pagination={false} size="small"
                columns={[
                  { title: '证型', dataIndex: 'pattern', key: 'pattern', render: (v: string) => <Tag color="red">{v}</Tag> },
                  { title: '人数', dataIndex: 'count', key: 'count' },
                  { title: '占比', dataIndex: 'percentage', key: 'pct',
                    render: (v: number) => (
                      <Space>
                        <Progress percent={v} size="small" strokeColor="#8B4513" showInfo={false} style={{ width: 100 }} />
                        <Text>{v}%</Text>
                      </Space>
                    ),
                  },
                ]} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="常用药品排名（真实数据）">
            {topHerbs.length === 0 ? (
              <Text type="secondary">暂无销售数据</Text>
            ) : (
              <Table dataSource={topHerbs} rowKey="name" pagination={false} size="small"
                columns={[
                  { title: '药品', dataIndex: 'name', key: 'name' },
                  { title: '使用次数', dataIndex: 'count', key: 'count' },
                  { title: '销售金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v}` },
                ]} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
