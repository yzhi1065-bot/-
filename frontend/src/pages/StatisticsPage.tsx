import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Table, Statistic, DatePicker, Space } from 'antd'
import { TeamOutlined, MedicineBoxOutlined, FileTextOutlined, RiseOutlined } from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function StatisticsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENTS, { params: { page: 1, page_size: 100 } })
      setPatients(res.data?.items || [])
    } catch (e) { /* ignore */ }
    setLoading(false)
  }

  const totalPatients = patients.length
  const todayPatients = patients.filter((p: any) =>
    dayjs(p.created_at).isSame(dayjs(), 'day')
  ).length

  // 模拟证型分布数据
  const patternDistribution = [
    { pattern: '脾肾阳虚证', count: 28, percentage: 28 },
    { pattern: '肝郁脾虚证', count: 22, percentage: 22 },
    { pattern: '痰湿内阻证', count: 18, percentage: 18 },
    { pattern: '气虚血瘀证', count: 15, percentage: 15 },
    { pattern: '阴虚火旺证', count: 12, percentage: 12 },
    { pattern: '其他', count: 5, percentage: 5 },
  ]

  // 模拟用药排名
  const herbRanking = [
    { rank: 1, name: '茯苓', count: 86, category: '利水渗湿' },
    { rank: 2, name: '白术', count: 78, category: '补气' },
    { rank: 3, name: '甘草', count: 72, category: '补气' },
    { rank: 4, name: '党参', count: 65, category: '补气' },
    { rank: 5, name: '当归', count: 58, category: '补血' },
    { rank: 6, name: '陈皮', count: 52, category: '理气' },
    { rank: 7, name: '半夏', count: 48, category: '化痰' },
    { rank: 8, name: '柴胡', count: 42, category: '解表' },
    { rank: 9, name: '白芍', count: 38, category: '补血' },
    { rank: 10, name: '黄芪', count: 35, category: '补气' },
  ]

  // 模拟就诊趋势
  const visitTrend = [
    { month: '1月', count: 42 }, { month: '2月', count: 38 },
    { month: '3月', count: 55 }, { month: '4月', count: 48 },
    { month: '5月', count: 62 }, { month: '6月', count: 58 },
  ]

  const patternColumns = [
    { title: '证型', dataIndex: 'pattern', key: 'pattern' },
    { title: '人数', dataIndex: 'count', key: 'count' },
    {
      title: '占比', dataIndex: 'percentage', key: 'percentage',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 8, background: '#F5F0EB', borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              width: `${v}%`, height: '100%',
              background: `linear-gradient(90deg, #8B4513, #D4A574)`,
              borderRadius: 4,
              transition: 'width 1s ease',
            }} />
          </div>
          <Text type="secondary" style={{ width: 40 }}>{v}%</Text>
        </div>
      ),
    },
  ]

  const herbColumns = [
    { title: '#', dataIndex: 'rank', key: 'rank', width: 50 },
    { title: '中药', dataIndex: 'name', key: 'name' },
    { title: '使用次数', dataIndex: 'count', key: 'count', sorter: (a: any, b: any) => a.count - b.count },
    { title: '分类', dataIndex: 'category', key: 'category' },
  ]

  const trendColumns = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    {
      title: '就诊量', dataIndex: 'count', key: 'count',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 12, background: '#F5F0EB', borderRadius: 6, overflow: 'hidden',
          }}>
            <div style={{
              width: `${(v / 62) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, #D4A574, #8B4513)',
              borderRadius: 6,
              transition: 'width 1s ease',
            }} />
          </div>
          <Text>{v}人</Text>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, fontFamily: '"Noto Serif SC", serif', color: '#8B4513' }}>
        📊 数据统计
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="tcm-stat-card">
            <Statistic title="总患者数" value={totalPatients} prefix={<TeamOutlined />} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="tcm-stat-card">
            <Statistic title="今日就诊" value={todayPatients} prefix={<MedicineBoxOutlined />} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="tcm-stat-card">
            <Statistic title="诊断报告" value={totalPatients} prefix={<FileTextOutlined />} suffix="份" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="tcm-stat-card">
            <Statistic title="使用草药" value={86} prefix={<RiseOutlined />} suffix="种" />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="证型分布" style={{ marginBottom: 16 }}>
            <Table
              dataSource={patternDistribution}
              columns={patternColumns}
              rowKey="pattern"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="就诊趋势（近6个月）" style={{ marginBottom: 16 }}>
            <Table
              dataSource={visitTrend}
              columns={trendColumns}
              rowKey="month"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Card title="常用中药排名" style={{ marginBottom: 16 }}>
        <Table
          dataSource={herbRanking}
          columns={herbColumns}
          rowKey="rank"
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="患者列表">
        <Table
          dataSource={patients}
          columns={[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '性别', dataIndex: 'gender', key: 'gender', render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-' },
            { title: '年龄', dataIndex: 'age', key: 'age' },
            { title: '建档时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
          ]}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  )
}
