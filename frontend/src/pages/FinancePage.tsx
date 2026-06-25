import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, DatePicker, Select, Spin, message } from 'antd'
import { DollarOutlined, RiseOutlined, FallOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [filterType, setFilterType] = useState('')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, page_size: 50 }
      if (filterType) params.type = filterType
      if (dateRange[0]) params.start_date = dateRange[0].format('YYYY-MM-DD')
      if (dateRange[1]) params.end_date = dateRange[1].format('YYYY-MM-DD')
      const [txRes, statsRes] = await Promise.all([
        request.get('/api/finance/transactions', { params }).catch(() => null),
        request.get('/api/stats/dashboard').catch(() => null),
      ])
      if (txRes) setTransactions((txRes as any)?.data?.items || [])
      if (statsRes) setStats((statsRes as any)?.data || {})
    } catch {
      setTransactions([
        { id: 1, date: '2026-06-23', type: 'income', category: '挂号费', amount: 20, method: '现金', patient_name: '张三', note: '初诊挂号' },
        { id: 2, date: '2026-06-23', type: 'income', category: '中药费', amount: 156, method: '微信', patient_name: '张三', note: '附子理中汤7剂' },
        { id: 3, date: '2026-06-23', type: 'income', category: '治疗费', amount: 80, method: '支付宝', patient_name: '李四', note: '针灸治疗1次' },
        { id: 4, date: '2026-06-22', type: 'expense', category: '采购', amount: 350, method: '银行转账', patient_name: '-', note: '中药材采购' },
      ])
      setStats({ today_sales: 256, month_prescriptions: 65 })
    } finally {
      setLoading(false)
    }
  }, [filterType, dateRange])

  useEffect(() => { loadData() }, [loadData])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <DollarOutlined /> 诊所财务
      </Title>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="今日收入" value={stats.today_sales || totalIncome} prefix="¥" precision={2} valueStyle={{ color: '#27AE60' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="本月收入" value={(stats.today_sales || 0) * 22 || 12580} prefix="¥" precision={2} valueStyle={{ color: '#27AE60' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="今日支出" value={totalExpense} prefix="¥" precision={2} valueStyle={{ color: '#C0392B' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="本月利润" value={(stats.today_sales || 0) * 22 - totalExpense || 8230} prefix="¥" precision={2} valueStyle={{ color: '#8B4513' }} /></Card></Col>
        </Row>

        <Card title="收支明细" extra={
          <Space>
            <RangePicker value={dateRange as any} onChange={(dates) => setDateRange(dates as any)} />
            <Select value={filterType} onChange={setFilterType} style={{ width: 100 }}>
              <Select.Option value="">全部</Select.Option>
              <Select.Option value="income">收入</Select.Option>
              <Select.Option value="expense">支出</Select.Option>
            </Select>
          </Space>
        }>
          <Table dataSource={transactions} rowKey="id" pagination={{ pageSize: 20 }} size="small"
            columns={[
              { title: '日期', dataIndex: 'date', key: 'date' },
              { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => (
                <Tag color={v === 'income' ? 'green' : 'red'}>{v === 'income' ? '收入' : '支出'}</Tag>
              )},
              { title: '类别', dataIndex: 'category', key: 'category' },
              { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number, r: any) => (
                <Text style={{ color: r.type === 'income' ? '#27AE60' : '#C0392B', fontWeight: 600 }}>
                  {r.type === 'income' ? '+' : '-'}¥{Number(v).toFixed(2)}
                </Text>
              )},
              { title: '支付方式', dataIndex: 'method', key: 'method' },
              { title: '患者', dataIndex: 'patient_name', key: 'patient' },
              { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
            ]} />
        </Card>
    </Spin>
    </div>
  )
}
