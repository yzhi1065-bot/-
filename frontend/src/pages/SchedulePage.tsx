import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Calendar, Badge, Spin, message } from 'antd'
import { TeamOutlined, SwapOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultSchedules = [
    { id: 1, doctor: '张医生', dept: '中医内科', mon: '全天', tue: '上午', wed: '全天', thu: '全天', fri: '上午', sat: '-', sun: '-' },
    { id: 2, doctor: '李医生', dept: '中医内科', mon: '上午', tue: '全天', wed: '上午', thu: '-', fri: '全天', sat: '上午', sun: '-' },
    { id: 3, doctor: '王医生', dept: '针灸科', mon: '全天', tue: '全天', wed: '-', thu: '全天', fri: '全天', sat: '-', sun: '-' },
    { id: 4, doctor: '刘医生', dept: '推拿科', mon: '-', tue: '上午', wed: '全天', thu: '上午', fri: '全天', sat: '全天', sun: '-' },
  ]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState(defaultSchedules)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ doctors: 4, onDuty: 3, weeklyShifts: 28, swapRequests: 2 })

  useEffect(() => {
    setLoading(true)
    request.get('/api/schedules').then((res: any) => {
      const d = res.data || res
      if (d.list) setSchedules(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <TeamOutlined /> 科室排班管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="值班医生" value={stats.doctors} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="今日在岗" value={stats.onDuty} suffix="人" /></Card></Col>
        <Col span={6}><Card><Statistic title="本周排班" value={stats.weeklyShifts} suffix="班次" /></Card></Col>
        <Col span={6}><Card><Statistic title="换班申请" value={stats.swapRequests} suffix="条" valueStyle={{ color: '#E67E22' }} /></Card></Col>
      </Row>

      <Card title="本周排班表" extra={<Button type="primary">编辑排班</Button>}>
        <Table dataSource={schedules} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '医生', dataIndex: 'doctor', key: 'doctor', render: (v: string) => <Text strong>{v}</Text> },
            { title: '科室', dataIndex: 'dept', key: 'dept' },
            { title: '周一', dataIndex: 'mon', key: 'mon', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周二', dataIndex: 'tue', key: 'tue', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周三', dataIndex: 'wed', key: 'wed', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周四', dataIndex: 'thu', key: 'thu', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周五', dataIndex: 'fri', key: 'fri', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周六', dataIndex: 'sat', key: 'sat', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
            { title: '周日', dataIndex: 'sun', key: 'sun', render: (v: string) => <Tag color={v !== '-' ? 'blue' : 'default'}>{v || '-'}</Tag> },
          ]}
          bordered />
      </Card>
    </div>
    </Spin>
  )
}
