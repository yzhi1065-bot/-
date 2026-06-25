import React, { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Tag, Divider, Progress, Table, Timeline, Space, Select, Rate, Spin, message } from 'antd'
import { RiseOutlined, MedicineBoxOutlined, CheckCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text, Paragraph } = Typography

// 模拟复诊对比数据
const defaultVisitCompareData = [
  { label: '畏寒肢冷', first: '重度', last: '轻微', improvement: 80 },
  { label: '纳差', first: '中度', last: '轻度', improvement: 60 },
  { label: '便溏', first: '重度', last: '已愈', improvement: 90 },
  { label: '乏力', first: '中度', last: '轻度', improvement: 50 },
  { label: '睡眠', first: '差', last: '改善', improvement: 40 },
]

const defaultVisitHistory = [
  { date: '2026-06-23', visitNo: 3, pattern: '脾肾阳虚证', prescription: '附子理中汤合平胃散加减', effect: '显效' },
  { date: '2026-05-20', visitNo: 2, pattern: '脾肾阳虚证', prescription: '附子理中汤加减', effect: '有效' },
  { date: '2026-04-15', visitNo: 1, pattern: '脾肾阳虚证', prescription: '理中汤合五苓散', effect: '初诊' },
]

export default function FollowupPage() {
  const [visitCompareData, setVisitCompareData] = useState(defaultVisitCompareData)
  const [visitHistory, setVisitHistory] = useState(defaultVisitHistory)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    request.get('/api/followups/visit-compare').then((res: any) => {
      const d = res.data || res
      if (d.symptoms) setVisitCompareData(d.symptoms)
      if (d.history) setVisitHistory(d.history)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <RiseOutlined /> 复诊跟踪
      </Title>

      {/* 总体疗效评价 */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f5f0eb 0%, #e8d5c4 100%)' }}>
        <Row gutter={24} align="middle">
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#27AE60' }}>显效</div>
            <Text type="secondary">总体疗效评估</Text>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>3</div>
            <Text type="secondary">总就诊次数</Text>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>65%</div>
            <Text type="secondary">症状改善率</Text>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Rate disabled value={4} />
            <div><Text type="secondary">患者满意度</Text></div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          {/* 症状改善对比 */}
          <Card title="症状改善对比" style={{ marginBottom: 16 }}>
            {visitCompareData.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <Row align="middle" gutter={8}>
                  <Col span={4}><Text strong>{item.label}</Text></Col>
                  <Col span={3}>
                    <Text delete style={{ color: '#C0392B' }}>{item.first}</Text>
                  </Col>
                  <Col span={3}>
                    <Text style={{ color: '#27AE60' }}>{item.last}</Text>
                  </Col>
                  <Col span={10}>
                    <Progress percent={item.improvement} strokeColor={{
                      '0%': '#D4A574',
                      '100%': '#27AE60',
                    }} size="small" format={() => ''} />
                  </Col>
                  <Col span={4}>
                    <Tag color={item.improvement >= 70 ? 'green' : item.improvement >= 40 ? 'orange' : 'red'}>
                      {item.improvement >= 70 ? '显著' : item.improvement >= 40 ? '改善' : '缓慢'}
                    </Tag>
                  </Col>
                </Row>
              </div>
            ))}
          </Card>

          {/* 复诊时间线 */}
          <Card title="就诊历程">
            <Timeline items={visitHistory.map(v => ({
              color: v.effect === '显效' ? 'green' : v.effect === '有效' ? 'blue' : 'gray',
              children: (
                <div>
                  <Text strong>{v.date}</Text>
                  <Space style={{ marginLeft: 8 }}>
                    <Tag>第{v.visitNo}次</Tag>
                    <Tag color="red">{v.pattern}</Tag>
                    <Tag color={v.effect === '显效' ? 'green' : v.effect === '有效' ? 'blue' : 'default'}>{v.effect}</Tag>
                  </Space>
                  <div style={{ marginTop: 4, color: '#666' }}>{v.prescription}</div>
                </div>
              ),
            }))} />
          </Card>
        </Col>

        <Col span={12}>
          {/* 历次证型对比 */}
          <Card title="证型演变" style={{ marginBottom: 16 }}>
            <Table dataSource={visitHistory} rowKey="visitNo" pagination={false} size="small"
              columns={[
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '诊次', dataIndex: 'visitNo', key: 'visitNo', render: (v: number) => `第${v}次` },
                { title: '证型', dataIndex: 'pattern', key: 'pattern', render: (v: string) => <Tag color="red">{v}</Tag> },
                { title: '疗效', dataIndex: 'effect', key: 'effect', render: (v: string) => (
                  <Tag color={v === '显效' ? 'green' : v === '有效' ? 'blue' : 'default'}>{v}</Tag>
                )},
              ]} />
          </Card>

          {/* 用药演变 */}
          <Card title="用药演变" style={{ marginBottom: 16 }}>
            <Timeline items={[
              { color: 'green', children: '第3次: 附子理中汤合平胃散加减（加砂仁、厚朴化湿）' },
              { color: 'blue', children: '第2次: 附子理中汤加减（便溏减当归，加薏苡仁）' },
              { color: 'gray', children: '第1次: 理中汤合五苓散（初诊，温阳利水）' },
            ]} />
          </Card>

          {/* 复诊建议 */}
          <Card title="复诊建议">
            <Space direction="vertical">
              <Text><CheckCircleOutlined style={{ color: '#27AE60' }} /> 症状改善明显，建议按原方继续服药7剂</Text>
              <Text><CheckCircleOutlined style={{ color: '#27AE60' }} /> 建议2周后复诊评估疗效</Text>
              <Text><MedicineBoxOutlined style={{ color: '#8B4513' }} /> 注意饮食调理，忌生冷油腻</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
