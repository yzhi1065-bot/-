import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Tag, Typography, Space, Progress, Timeline, Badge, Button, Table, Alert, Spin } from 'antd'
import {
  TeamOutlined, MedicineBoxOutlined, FileTextOutlined, RiseOutlined,
  BellOutlined, ClockCircleOutlined, CheckCircleOutlined, RightOutlined,
  WarningOutlined, DollarOutlined, ExperimentOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'
import { API_BASE_URL, API_ENDPOINTS } from '../services/api'

const { Title, Text } = Typography

interface DashboardStats {
  total_patients: number
  today_patients: number
  total_sessions: number
  pending_reviews: number
}

interface MonthlyTrend {
  month: string
  count: number
}

interface TopHerb {
  name: string
  count: number
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [topHerbs, setTopHerbs] = useState<TopHerb[]>([])

  const alerts = [
    { type: 'warning', text: '库存预警：制附子库存仅80g，低于报警值' },
    { type: 'info', text: '复诊提醒：5位患者已超30天未复诊' },
    { type: 'error', text: '异常检验：李四肝功能指标异常需关注' },
  ]

  const quickActions = [
    { title: '新建患者', icon: <TeamOutlined />, link: '/patients', color: '#8B4513' },
    { title: '开始诊疗', icon: <MedicineBoxOutlined />, link: '/diagnosis', color: '#C0392B' },
    { title: '药品入库', icon: <FileTextOutlined />, link: '/pharmacy/purchases', color: '#27AE60' },
    { title: '查看报表', icon: <RiseOutlined />, link: '/report-analysis', color: '#5B8DEF' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [dashboardRes, trendRes, herbsRes] = await Promise.all([
          request.get(API_ENDPOINTS.STATS_DASHBOARD),
          request.get(API_ENDPOINTS.STATS_MONTHLY_TREND),
          request.get(API_ENDPOINTS.STATS_TOP_HERBS),
        ])

        if (dashboardRes && (dashboardRes as any).code === 0) {
          setDashboardData((dashboardRes as any).data)
        }
        if (trendRes && (trendRes as any).code === 0) {
          setMonthlyTrend((trendRes as any).data)
        }
        if (herbsRes && (herbsRes as any).code === 0) {
          setTopHerbs((herbsRes as any).data)
        }
      } catch (e) {
        console.error('Failed to load dashboard stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const todayStats = [
    { title: '今日挂号', value: dashboardData?.today_patients ?? 0, unit: '人', color: '#8B4513' },
    { title: '已完成', value: dashboardData?.total_sessions ?? 0, unit: '人', color: '#27AE60' },
    { title: '候诊中', value: dashboardData?.pending_reviews ?? 0, unit: '人', color: '#E67E22' },
    { title: '复诊率', value: 65, unit: '%', color: '#5B8DEF' },
  ]

  const weeklyRevenue = [
    { day: '周一', revenue: 520 },
    { day: '周二', revenue: 480 },
    { day: '周三', revenue: 650 },
    { day: '周四', revenue: 380 },
    { day: '周五', revenue: 720 },
    { day: '周六', revenue: 280 },
    { day: '周日', revenue: 0 },
  ]

  const currentMonthIncome = monthlyTrend.length > 0
    ? monthlyTrend[monthlyTrend.length - 1].count * 200
    : 12580
  const currentMonthProfit = Math.round(currentMonthIncome * 0.65)
  const totalVisits = monthlyTrend.reduce((sum, m) => sum + m.count, 0)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* 顶部标题和通知 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', margin: 0 }}>工作台</Title>
          <Text type="secondary">欢迎回来，今天也是充实的一天</Text>
        </div>
        <Space>
          <Badge count={3}>
            <Button shape="circle" icon={<BellOutlined />} onClick={() => navigate('/notifications')} />
          </Badge>
          <Button onClick={() => navigate('/queue')}>候诊队列 <RightOutlined /></Button>
        </Space>
      </div>

      {/* 智能提醒 */}
      <div style={{ marginBottom: 16 }}>
        {alerts.map((a, idx) => (
          <Alert key={idx} message={a.text} type={a.type as any} showIcon closable style={{ marginBottom: 4 }} />
        ))}
      </div>

      {/* 经营概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {todayStats.map((item, idx) => (
          <Col span={6} key={idx}>
            <Card hoverable>
              <Statistic title={item.title} value={item.value} suffix={item.unit} valueStyle={{ color: item.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        {/* 快捷操作 */}
        <Col span={6}>
          <Card title="快捷操作" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              {quickActions.map((item, idx) => (
                <Col span={12} key={idx}>
                  <Card size="small" hoverable style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate(item.link)}>
                    <div style={{ fontSize: 22, color: item.color, marginBottom: 4 }}>{item.icon}</div>
                    <Text style={{ fontSize: 12 }}>{item.title}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {topHerbs.length > 0 && (
            <Card title="常用药品" size="small" style={{ marginBottom: 16 }}>
              {topHerbs.map((herb, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12 }}>{herb.name}</Text>
                  <Text style={{ fontSize: 12, color: '#8B4513' }}>{herb.count}次</Text>
                </div>
              ))}
            </Card>
          )}

          <Card title="本周收入" size="small">
            {weeklyRevenue.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 12 }}>{item.day}</Text>
                  <Text style={{ fontSize: 12, color: '#8B4513' }}>¥{item.revenue}</Text>
                </div>
                <Progress percent={Math.round(item.revenue / 720 * 100)} size="small" strokeColor="#8B4513" showInfo={false} />
              </div>
            ))}
          </Card>
        </Col>

        {/* 经营看板 */}
        <Col span={10}>
          <Card title="经营看板" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="本月收入" value={currentMonthIncome} prefix="¥" valueStyle={{ color: '#27AE60', fontSize: 20 }} />
              </Col>
              <Col span={8}>
                <Statistic title="本月利润" value={currentMonthProfit} prefix="¥" valueStyle={{ color: '#8B4513', fontSize: 20 }} />
              </Col>
              <Col span={8}>
                <Statistic title="就诊量" value={totalVisits} suffix="人" valueStyle={{ fontSize: 20 }} />
              </Col>
            </Row>
          </Card>

          {monthlyTrend.length > 0 && (
            <Card title="月度趋势" size="small" style={{ marginBottom: 16 }}>
              {monthlyTrend.map((item, idx) => {
                const maxCount = Math.max(...monthlyTrend.map(m => m.count), 1)
                return (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 12 }}>{item.month}</Text>
                      <Text style={{ fontSize: 12, color: '#5B8DEF' }}>{item.count}人</Text>
                    </div>
                    <Progress percent={Math.round(item.count / maxCount * 100)} size="small" strokeColor="#5B8DEF" showInfo={false} />
                  </div>
                )
              })}
            </Card>
          )}

          <Card title="今日时间线" size="small">
            <Timeline items={[
              { color: 'green', children: '09:00 患者张三复诊（脾肾阳虚）' },
              { color: 'blue', children: '09:30 患者李四初诊（失眠）' },
              { color: 'orange', children: '10:00 患者王五复诊（腰痛）' },
              { color: 'gray', children: '10:30 患者赵六初诊（月经不调）' },
              { color: 'gray', children: '11:00 患者陈七复诊（咳嗽）' },
            ]} />
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col span={8}>
          <Card title="系统状态" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>后端服务</Text><Tag color="green">运行中</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>AI服务</Text><Tag color="orange">演示模式</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>数据库</Text><Tag color="green">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>离线缓存</Text><Tag color="blue">0条待同步</Tag>
              </div>
            </Space>
          </Card>

          <Card title="常用功能" size="small">
            <Row gutter={[8, 8]}>
              {[
                { icon: <ExperimentOutlined />, label: '检查检验', link: '/lab-test', color: '#8B4513' },
                { icon: <DollarOutlined />, label: '财务管理', link: '/finance', color: '#27AE60' },
                { icon: <MedicineBoxOutlined />, label: '医保结算', link: '/insurance', color: '#5B8DEF' },
                { icon: <ClockCircleOutlined />, label: '排班管理', link: '/schedule', color: '#E67E22' },
              ].map((item, idx) => (
                <Col span={12} key={idx}>
                  <Button block style={{ textAlign: 'left', height: 36, marginBottom: 4 }}
                    onClick={() => navigate(item.link)}>
                    <span style={{ color: item.color }}>{item.icon}</span> {item.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
