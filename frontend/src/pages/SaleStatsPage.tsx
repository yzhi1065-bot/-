import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Input, Space, DatePicker, Typography, Row, Col, Statistic, Tag, message } from 'antd'
import { SearchOutlined, DollarOutlined, ProfileOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function SaleStatsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [summary, setSummary] = useState({ total_sales: 0, total_profit: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 20 }
      if (keyword) params.keyword = keyword
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res: any = await request.get('/api/pharmacy/sales', { params })
      setData(res.data?.items || [])
      setTotal(res.data?.total || 0)
      setSummary({ total_sales: res.data?.total_sales || 0, total_profit: res.data?.total_profit || 0 })
    } catch (e) { /* ignore */ }
    setLoading(false)
  }, [page, keyword, dateFrom, dateTo])

  useEffect(() => { loadData() }, [loadData])

  const columns = [
    { title: '日期', dataIndex: 'sale_date', key: 'date', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: '药品', dataIndex: 'drug_name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: '数量', dataIndex: 'quantity', key: 'qty' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 50 },
    { title: '进价', dataIndex: 'purchase_price', key: 'pp', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '售价', dataIndex: 'selling_price', key: 'sp', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '金额', dataIndex: 'total_amount', key: 'amt', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '利润', dataIndex: 'profit', key: 'profit', render: (v: number) => (
      <Tag color={v >= 0 ? 'green' : 'red'}>{v ? `¥${v.toFixed(2)}` : '-'}</Tag>
    )},
    { title: '患者', dataIndex: 'patient_name', key: 'patient', render: (v: string) => v || '-' },
    { title: '医师', dataIndex: 'doctor_name', key: 'doctor', render: (v: string) => v || '-' },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        销售统计
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="销售总额" value={summary.total_sales} prefix="¥" precision={2}
            valueStyle={{ color: '#8B4513' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="总利润" value={summary.total_profit} prefix="¥" precision={2}
            valueStyle={{ color: summary.total_profit >= 0 ? '#27AE60' : '#C0392B' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="利润率" value={summary.total_sales > 0
            ? ((summary.total_profit / summary.total_sales) * 100).toFixed(1) : 0} suffix="%"
            valueStyle={{ color: '#5B8DEF' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="交易笔数" value={total} /></Card>
        </Col>
      </Row>

      <Card extra={
        <Space>
          <RangePicker onChange={(dates) => {
            if (dates) { setDateFrom(dates[0]?.format('YYYY-MM-DD') || ''); setDateTo(dates[1]?.format('YYYY-MM-DD') || '') }
            else { setDateFrom(''); setDateTo('') }
          }} />
          <Input.Search placeholder="搜索药品/患者/医师" value={keyword}
            onChange={(e) => setKeyword(e.target.value)} onSearch={() => { setPage(1); loadData() }}
            style={{ width: 220 }} />
        </Space>
      }>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: (t) => `共 ${t} 笔` }}
          size="small" scroll={{ x: 1100 }} />
      </Card>
    </div>
  )
}
