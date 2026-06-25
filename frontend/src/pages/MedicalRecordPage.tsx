import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Descriptions, Tabs, Spin, Input, message } from 'antd'
import { FileTextOutlined, SearchOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'

const { Title, Text } = Typography

export default function MedicalRecordPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [recRes, statsRes] = await Promise.all([
        request.get('/api/patients/records', { params: { page: 1, page_size: 50, keyword: search || undefined } }).catch(() => null),
        request.get('/api/stats/dashboard').catch(() => null),
      ])
      if (recRes) setRecords((recRes as any)?.data?.items || [])
      if (statsRes) setStats((statsRes as any)?.data || {})
    } catch {
      setRecords([
        { id: 1, record_no: 'MR20260001', patient_name: '张三', visit_date: '2026-06-23', doctor_name: '张医生', diagnosis: '脾肾阳虚证', visit_type: '门诊', status: 'completed' },
        { id: 2, record_no: 'MR20260002', patient_name: '李四', visit_date: '2026-06-20', doctor_name: '张医生', diagnosis: '肝郁脾虚证', visit_type: '门诊', status: 'completed' },
        { id: 3, record_no: 'MR20260003', patient_name: '王五', visit_date: '2026-06-18', doctor_name: '李医生', diagnosis: '腰痛', visit_type: '住院', status: 'ongoing' },
      ])
      setStats({ total_sessions: 156, today_patients: 28, pending_reviews: 14 })
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <FileTextOutlined /> 病历管理
      </Title>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="总病历数" value={stats.total_sessions || 156} prefix={<FileTextOutlined />} /></Card></Col>
          <Col span={6}><Card><Statistic title="本月新增" value={stats.today_patients || 28} prefix={<PlusOutlined />} /></Card></Col>
          <Col span={6}><Card><Statistic title="已完成" value={(stats.total_sessions || 156) - (stats.pending_reviews || 14)} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#27AE60' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="待完善" value={stats.pending_reviews || 14} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#E67E22' }} /></Card></Col>
        </Row>

        <Card title="病历列表" extra={
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜索病历..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} allowClear />
            <Button type="primary" icon={<PlusOutlined />}>新建病历</Button>
          </Space>
        }>
          <Table dataSource={records} rowKey="id" pagination={{ pageSize: 20 }} size="small"
            columns={[
              { title: '病历号', dataIndex: 'record_no', key: 'no' },
              { title: '患者', dataIndex: 'patient_name', key: 'patient' },
              { title: '日期', dataIndex: 'visit_date', key: 'date' },
              { title: '医生', dataIndex: 'doctor_name', key: 'doctor' },
              { title: '诊断', dataIndex: 'diagnosis', key: 'diagnosis', render: (v: string) => <Tag color="red">{v}</Tag> },
              { title: '类型', dataIndex: 'visit_type', key: 'type', render: (v: string) => <Tag color={v === '门诊' ? 'blue' : 'purple'}>{v}</Tag> },
              { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'completed' ? 'green' : 'orange'}>{v === 'completed' ? '已完成' : '进行中'}</Tag> },
              { title: '操作', key: 'action', render: (_: any, r: any) => (
                <Space>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/diagnosis/${r.id}`)}>查看</Button>
                  <Button size="small">打印</Button>
                </Space>
              )},
            ]} />
        </Card>
      </Spin>
    </div>
  )
}

