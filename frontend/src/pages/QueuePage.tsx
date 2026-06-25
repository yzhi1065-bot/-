import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Progress, Select, Badge, Row, Col, Statistic, message, List, Timeline, Input, Spin, Alert } from 'antd'
import {
  TeamOutlined, MedicineBoxOutlined, PlayCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, SearchOutlined, UserOutlined, ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'

const { Title, Text } = Typography

export default function QueuePage() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const loadQueue = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/api/diagnosis/sessions', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined, page: 1, page_size: 50 }
      })
      const items = res?.data?.items || []
      setQueue(items.map((s: any) => ({
        id: s.id,
        name: s.patient?.name || `患者#${s.patient_id}`,
        age: s.patient?.age || 30,
        gender: s.patient?.gender === 'male' ? '男' : s.patient?.gender === 'female' ? '女' : '未知',
        chief_complaint: s.chief_complaint || '未填写',
        status: s.status || 'waiting',
        waitTime: s.created_at ? Math.floor((Date.now() - new Date(s.created_at).getTime()) / 60000) : 0,
        level: s.priority || 'normal',
      })))
    } catch {
      // Fallback mock data
      setQueue([
        { id: 1, name: '张三', age: 45, gender: '男', chief_complaint: '胃痛反复2周', status: 'waiting', waitTime: 5, level: 'normal' },
        { id: 2, name: '李四', age: 32, gender: '女', chief_complaint: '失眠多梦1月', status: 'waiting', waitTime: 12, level: 'normal' },
        { id: 3, name: '王五', age: 58, gender: '男', chief_complaint: '腰痛伴下肢麻木', status: 'waiting', waitTime: 18, level: 'urgent' },
        { id: 4, name: '赵六', age: 28, gender: '女', chief_complaint: '月经不调3月', status: 'examining', waitTime: 0, level: 'normal' },
        { id: 5, name: '陈七', age: 65, gender: '男', chief_complaint: '咳嗽气喘1周', status: 'waiting', waitTime: 25, level: 'urgent' },
      ])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadQueue() }, [loadQueue])

  const filtered = queue.filter(p => !search || p.name.includes(search))

  const waiting = queue.filter(p => p.status === 'waiting').length
  const examining = queue.filter(p => p.status === 'examining').length
  const completed = queue.filter(p => p.status === 'completed').length

  const handleStart = async (id: number) => {
    try {
      await request.post(`/api/diagnosis/sessions/${id}/start`)
      message.success('开始诊疗')
      loadQueue()
    } catch {
      message.error('操作失败')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await request.post(`/api/diagnosis/sessions/${id}/complete`)
      message.success('诊疗完成')
      loadQueue()
    } catch {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '#', key: 'idx', width: 50, render: (_: any, __: any, idx: number) => idx + 1 },
    { title: '姓名', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: '信息', key: 'info', render: (_: any, r: any) => <Text type="secondary">{r.gender} · {r.age}岁</Text> },
    { title: '主诉', dataIndex: 'chief_complaint', key: 'complaint', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const config: Record<string, { label: string; color: string }> = {
          waiting: { label: '候诊中', color: 'blue' },
          examining: { label: '诊疗中', color: 'orange' },
          completed: { label: '已完成', color: 'green' },
          pending: { label: '待报到', color: 'default' },
        }
        return <Tag color={config[v]?.color}>{config[v]?.label}</Tag>
      },
    },
    {
      title: '级别', dataIndex: 'level', key: 'level',
      render: (v: string) => <Tag color={v === 'urgent' ? 'red' : 'blue'}>{v === 'urgent' ? '优先' : '普通'}</Tag>,
    },
    {
      title: '等待', dataIndex: 'waitTime', key: 'wait',
      render: (v: number) => v > 0 ? <Text type="secondary">{v}分钟</Text> : '-',
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'waiting' &&
            <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStart(record.id)}>开始</Button>}
          {record.status === 'examining' &&
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleComplete(record.id)}
              style={{ background: '#27AE60', borderColor: '#27AE60' }}>完成</Button>}
          <Button size="small" onClick={() => navigate(`/diagnosis/${record.id}`)}>诊疗</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <TeamOutlined /> 排队与批量诊断
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="候诊人数" value={waiting} prefix={<ClockCircleOutlined />} suffix="人" valueStyle={{ color: '#C0392B' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="诊疗中" value={examining} prefix={<MedicineBoxOutlined />} suffix="人" valueStyle={{ color: '#E67E22' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="今日已完成" value={completed} prefix={<CheckCircleOutlined />} suffix="人" valueStyle={{ color: '#27AE60' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="今日总量" value={queue.length} prefix={<TeamOutlined />} suffix="人" /></Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Card extra={
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜索患者..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }}>
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="waiting">候诊中</Select.Option>
              <Select.Option value="examining">诊疗中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadQueue}>刷新</Button>
          </Space>
        }>
          <Table dataSource={filtered} rowKey="id" pagination={{ pageSize: 20 }} size="small" columns={columns} />
        </Card>
      </Spin>
    </div>
  )
}
