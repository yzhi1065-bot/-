import React, { useState, useEffect } from 'react'
import { Card, Rate, Typography, Row, Col, Statistic, Table, Tag, Spin, Input, Button, message as msg } from 'antd'
import { StarOutlined, LikeOutlined, SmileOutlined, FrownOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TextArea } = Input

const mockData = [
  { id: 1, score: 5, effect: 5, feedback: '医生很专业，治疗效果很好', created_at: '2026-06-20' },
  { id: 2, score: 4, effect: 4, feedback: '态度好，药效明显', created_at: '2026-06-18' },
]

export default function SatisfactionPage() {
  const [loading, setLoading] = useState(false)
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>(mockData)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [effectScore, setEffectScore] = useState(0)

  useEffect(() => {
    try {
      request.get('/api/satisfaction/feedbacks').then((res: any) => {
        const d = res?.data || res
        if (d?.list) setRecentFeedbacks(d.list)
      }).catch(() => {})
    } catch (e) {}
  }, [])

  const handleSubmit = () => {
    if (score === 0) {
      msg.warning('请评分')
      return
    }
    setSubmitted(true)
    msg.success('感谢您的评价！')
  }

  const avgScore = recentFeedbacks.length > 0
    ? (recentFeedbacks.reduce((s, f) => s + f.score, 0) / recentFeedbacks.length).toFixed(1)
    : '0.0'

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <StarOutlined /> 患者满意度
      </Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="综合评分" value={avgScore} prefix={<StarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="评价总数" value={recentFeedbacks.length} prefix={<SmileOutlined />} /></Card></Col>
      </Row>

      {!submitted ? (
        <Card title="提交评价" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}><Text strong>总体评分：</Text><Rate value={score} onChange={setScore} /></div>
          <div style={{ marginBottom: 16 }}><Text strong>疗效评价：</Text><Rate value={effectScore} onChange={setEffectScore} /></div>
          <div style={{ marginBottom: 16 }}><Text strong>评价内容：</Text><TextArea rows={3} placeholder="请描述您的就诊体验..." value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          <Button type="primary" onClick={handleSubmit}>提交评价</Button>
        </Card>
      ) : (
        <Card title="提交成功" style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}><SmileOutlined style={{ color: '#27AE60' }} /></div>
          <Text>感谢您的宝贵意见！</Text>
        </Card>
      )}

      <Card title="近期评价">
        <Table dataSource={recentFeedbacks} rowKey="id" pagination={{ pageSize: 5 }} size="small"
          columns={[
            { title: '评分', dataIndex: 'score', render: (v: number) => <Rate disabled value={v} /> },
            { title: '疗效', dataIndex: 'effect', render: (v: number) => <Rate disabled value={v} /> },
            { title: '反馈', dataIndex: 'feedback' },
            { title: '时间', dataIndex: 'created_at' },
          ]}
        />
      </Card>
    </div>
    </Spin>
  )
}
