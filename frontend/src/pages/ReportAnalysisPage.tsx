import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Row, Col, Statistic, Progress, Button, DatePicker, Spin, message } from 'antd'
import { BarChartOutlined, RiseOutlined, TeamOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const defaultMonthlyStats = [
    { month: '1月', visits: 42, revenue: 4200, profit: 2800, new_patients: 18 },
    { month: '2月', visits: 38, revenue: 3800, profit: 2500, new_patients: 15 },
    { month: '3月', visits: 55, revenue: 5500, profit: 3600, new_patients: 22 },
    { month: '4月', visits: 48, revenue: 4800, profit: 3200, new_patients: 20 },
    { month: '5月', visits: 62, revenue: 6200, profit: 4100, new_patients: 28 },
    { month: '6月', visits: 58, revenue: 5800, profit: 3800, new_patients: 25 },
  ]

const defaultDoctorStats = [
    { doctor: '张医生', visits: 86, revenue: 8600, avg_score: 4.8, patients: 45 },
    { doctor: '李医生', visits: 52, revenue: 5200, avg_score: 4.6, patients: 30 },
    { doctor: '王医生', visits: 38, revenue: 3800, avg_score: 4.9, patients: 22 },
  ]

export default function ReportAnalysisPage() {
  const [monthlyStats, setMonthlyStats] = useState(defaultMonthlyStats)
  const [doctorStats, setDoctorStats] = useState(defaultDoctorStats)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ avgVisits: 50.5, avgRevenue: 5050, avgProfit: 3350, growthRate: 12.5 })

  useEffect(() => {
    setLoading(true)
    request.get('/stats/reports').then((res: any) => {
      const d = res.data || res
      if (d.monthly) setMonthlyStats(d.monthly)
      if (d.doctors) setDoctorStats(d.doctors)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <BarChartOutlined /> 统计分析报表
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="月均就诊" value={stats.avgVisits} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="月均收入" value={stats.avgRevenue} prefix="¥" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="月均利润" value={stats.avgProfit} prefix="¥" valueStyle={{ color: '#8B4513' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="患者增长率" value={stats.growthRate} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="月度经营数据" extra={<RangePicker size="small" />}>
            <Table dataSource={monthlyStats} rowKey="month" pagination={false} size="small"
              columns={[
                { title: '月份', dataIndex: 'month', key: 'month' },
                { title: '就诊量', dataIndex: 'visits', key: 'visits',
                  render: (v: number) => <div><Progress percent={Math.round(v / 62 * 100)} size="small" showInfo={false} strokeColor="#8B4513" /><Text>{v}</Text></div>,
                },
                { title: '收入', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `¥${v}` },
                { title: '利润', dataIndex: 'profit', key: 'profit', render: (v: number) => `¥${v}` },
                { title: '新患者', dataIndex: 'new_patients', key: 'new' },
              ]} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="医生工作量统计">
            <Table dataSource={doctorStats} rowKey="doctor" pagination={false} size="small"
              columns={[
                { title: '医生', dataIndex: 'doctor', key: 'doctor' },
                { title: '就诊量', dataIndex: 'visits', key: 'visits' },
                { title: '收入', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `¥${v}` },
                { title: '评分', dataIndex: 'avg_score', key: 'score', render: (v: number) => <Tag color="blue">{v}</Tag> },
                { title: '患者数', dataIndex: 'patients', key: 'patients' },
              ]} />
          </Card>
        </Col>
      </Row>

      <Card title="报表导出" style={{ marginTop: 16 }}>
        <Space>
          <Button icon={<FileTextOutlined />}>导出月报</Button>
          <Button icon={<FileTextOutlined />}>导出日报</Button>
          <Button icon={<FileTextOutlined />}>导出医生工作量</Button>
        </Space>
      </Card>
    </div>
    </Spin>
  )
}
