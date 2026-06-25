import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Descriptions, Timeline, Input, Select, Spin, message } from 'antd'
import { MedicineBoxOutlined, UserOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultRecords = [
    { id: 1, date: '2026-06-23', patient: '张三', nurse: '王护士', type: '晨间护理', content: '测量生命体征正常，协助晨间洗漱', status: 'completed' },
    { id: 2, date: '2026-06-23', patient: '李四', nurse: '王护士', type: '治疗护理', content: '中药熏洗治疗30分钟，观察无不适', status: 'completed' },
    { id: 3, date: '2026-06-22', patient: '张三', nurse: '刘护士', type: '晚间护理', content: '睡前中药足浴，患者睡眠良好', status: 'completed' },
    { id: 4, date: '2026-06-22', patient: '王五', nurse: '王护士', type: '康复护理', content: '指导八段锦练习15分钟', status: 'ongoing' },
  ]

const defaultHandovers = [
    { date: '2026-06-23', shift: '白班', nurse: '王护士', patients: 8, key_issues: '张三明日需复查' },
    { date: '2026-06-22', shift: '夜班', nurse: '刘护士', patients: 5, key_issues: '一切正常' },
  ]

export default function NursingPage() {
  const [records, setRecords] = useState(defaultRecords)
  const [handovers, setHandovers] = useState(defaultHandovers)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ todayNursing: 8, inPatients: 3, completed: 6, pending: 2 })

  useEffect(() => {
    setLoading(true)
    request.get('/api/nursing').then((res: any) => {
      const d = res.data || res
      if (d.records) setRecords(d.records)
      if (d.handovers) setHandovers(d.handovers)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <MedicineBoxOutlined /> 护理记录管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="今日护理" value={stats.todayNursing} suffix="人次" /></Card></Col>
        <Col span={6}><Card><Statistic title="在护患者" value={stats.inPatients} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} suffix="项" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={stats.pending} suffix="项" valueStyle={{ color: '#E67E22' }} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="护理记录" extra={<Space><Input placeholder="搜索患者..." prefix={<SearchOutlined />} style={{ width: 180 }} /><Button type="primary">新增记录</Button></Space>}>
            <Table dataSource={records} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '患者', dataIndex: 'patient', key: 'patient' },
                { title: '护士', dataIndex: 'nurse', key: 'nurse' },
                { title: '护理类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
                { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
                { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
                  <Tag color={v === 'completed' ? 'green' : 'orange'}>{v === 'completed' ? '已完成' : '进行中'}</Tag>
                )},
              ]} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="交接班记录">
            <Table dataSource={handovers} rowKey={(r: any) => r.date + r.shift} pagination={false} size="small"
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '班次', dataIndex: 'shift', key: 'shift', render: (v: string) => <Tag color={v === '白班' ? 'blue' : 'purple'}>{v}</Tag> },
                { title: '护士', dataIndex: 'nurse', key: 'nurse' },
                { title: '患者数', dataIndex: 'patients', key: 'patients' },
              ]} />
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
