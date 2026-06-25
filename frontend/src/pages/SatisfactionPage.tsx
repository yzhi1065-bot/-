import React, { useState, useEffect } from 'react'
import { Card, Rate, Typography, Row, Col, Statistic, Table, Tag, Spin, message, Input } from 'antd'
import { StarOutlined, LikeOutlined, SmileOutlined, FrownOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TextArea } = Input

export default function SatisfactionPage() {
  const [loading, setLoading] = useState(false)
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [effectScore, setEffectScore] = useState(0)

  useEffect(() => {
    setLoading(true)
    request.get('/satisfaction/feedbacks').then((res: any) => {
      const d = res.data || res
      if (d.list) setRecentFeedbacks(d.list)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubmit = () => {
    if (score === 0) {
      message.warning('请评分')
      return
    }
    setSubmitted(true)
    message.success('感谢您的评价！')
  }

  const avgScore = recentFeedbacks.length > 0
    ? (recentFeedbacks.reduce((sum, f) => sum + f.score, 0) / recentFeedbacks.length).toFixed(1)
    : '0.0'
  const avgEffect = recentFeedbacks.length > 0
    ? (recentFeedbacks.reduce((sum, f) => sum + f.effect, 0) / recentFeedbacks.length).toFixed(1)
    : '0.0'

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <StarOutlined /> 患者满意度
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>{avgScore}</div>
            <Rate disabled value={Number(avgScore)} />
            <div><Text type="secondary">综合评分</Text></div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#27AE60' }}>{avgEffect}</div>
            <Rate disabled value={Number(avgEffect)} />
            <div><Text type="secondary">疗效评分</Text></div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic title="评价总数" value={recentFeedbacks.length} prefix={<SmileOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic title="满意度" value={recentFeedbacks.filter(f => f.score >= 4).length} suffix={`/ ${recentFeedbacks.length}`} />
          </Card>
        </Col>
      </Row>

      {!submitted ? (
        <Card title="提交评价" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>总体评分：</Text>
            <Rate value={score} onChange={setScore} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>疗效评价：</Text>
            <Rate value={effectScore} onChange={setEffectScore} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>评价内容：</Text>
            <TextArea rows={3} placeholder="请描述您的就诊体验..." value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>
          <Button type="primary" onClick={handleSubmit}>提交评价</Button>
        </Card>
      ) : (
        <Card title="提交成功" style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}><SmileOutlined style={{ color: '#27AE60' }} /></div>
          <Text>感谢您的宝贵意见！</Text>
        </Card>
      )}

      <Card title="近期评价">
        <Table dataSource={recentFeedbacks} rowKey="id" pagination={{ pageSize: 5 }} size="small"
          columns={[
            { title: '评分', dataIndex: 'score', key: 'score', render: (v: number) => <Rate disabled value={v} /> },
            { title: '疗效', dataIndex: 'effect', key: 'effect', render: (v: number) => <Rate disabled value={v} /> },
            { title: '反馈', dataIndex: 'feedback', key: 'feedback' },
            { title: '时间', dataIndex: 'created_at', key: 'created_at' },
          ]}
        />
      </Card>
    </div>
    </Spin>
  )
}
