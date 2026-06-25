import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Tabs, Input, message, Spin } from 'antd'
import { ReadOutlined, PlusOutlined, EyeOutlined, LikeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultArticles = [
    { id: 1, title: '冬季养生：阳虚体质如何过冬', category: '季节养生', author: '张医生', date: '2026-06-20', views: 156, likes: 23, status: 'published' },
    { id: 2, title: '脾胃虚寒的饮食调理方法', category: '饮食调理', author: '李医生', date: '2026-06-18', views: 98, likes: 15, status: 'published' },
    { id: 3, title: '八段锦每日练习指南', category: '运动养生', author: '王医生', date: '2026-06-15', views: 210, likes: 45, status: 'published' },
    { id: 4, title: '失眠的中医调理方案', category: '疾病防治', author: '张医生', date: '2026-06-12', views: 178, likes: 32, status: 'draft' },
  ]

export default function HealthEduPage() {
  const [articles, setArticles] = useState(defaultArticles)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 12, published: 10, views: 1256, likes: 235 })

  useEffect(() => {
    setLoading(true)
    request.get('/health-edu/articles').then((res: any) => {
      const d = res.data || res
      if (d.list) setArticles(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <ReadOutlined /> 健康宣教管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="总文章" value={stats.total} prefix={<ReadOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已发布" value={stats.published} prefix={<EyeOutlined />} valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总阅读" value={stats.views} prefix={<EyeOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="总点赞" value={stats.likes} prefix={<LikeOutlined />} /></Card></Col>
      </Row>

      <Card extra={<Space><Input.Search placeholder="搜索文章..." style={{ width: 200 }} /><Button type="primary" icon={<PlusOutlined />}>写文章</Button></Space>}>
        <Table dataSource={articles} rowKey="id" pagination={false} size="small"
          columns={[
            { title: '标题', dataIndex: 'title', key: 'title', render: (v: string) => <Text strong>{v}</Text> },
            { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '作者', dataIndex: 'author', key: 'author' },
            { title: '日期', dataIndex: 'date', key: 'date' },
            { title: '阅读', dataIndex: 'views', key: 'views' },
            { title: '点赞', dataIndex: 'likes', key: 'likes' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'published' ? 'green' : 'orange'}>{v === 'published' ? '已发布' : '草稿'}</Tag> },
            { title: '操作', key: 'action', render: () => <Space><Button size="small">编辑</Button><Button size="small">发布</Button></Space> },
          ]} />
      </Card>
    </div>
    </Spin>
  )
}
