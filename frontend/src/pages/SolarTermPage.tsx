import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Typography, Space, Tabs, List, Divider, Alert, Progress, Spin, message } from 'antd'
import request from '../services/http'
import {
  EnvironmentOutlined, SunOutlined, CloudOutlined,
  CoffeeOutlined, MedicineBoxOutlined, BookOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultSolarTerms = [
  { name: '适宜', date: '2?3-5?', season: '?', desc: '节气养生节气养生节气养生节气养生节气养生?', foods: ['适宜', '适宜', '适宜', '适宜'], points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生节气养生适宜?' },
  { name: '适宜', date: '2?18-20?', season: '?', desc: '节气养生节气养生节气养生节气养生适宜', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜?', '适宜?', '适宜'], tips: '节气养生节气养生节气养生节气养生' },
  { name: '适宜', date: '3?5-7?', season: '?', desc: '节气养生节气养生节气养生节气养生节气养生?', foods: '?,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生适宜' },
  { name: '适宜', date: '3?20-22?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜?', '适宜'], tips: '节气养生节气养生节气养生适宜?' },
  { name: '适宜', date: '4?4-6?', season: '?', desc: '节气养生节气养生节气养生节气养生适宜', foods: '适宜,适宜,适宜?,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生适宜' },
  { name: '适宜', date: '4?19-21?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜?,适宜'.split(','), points: ['适宜?', '适宜', '适宜'], tips: '节气养生节气养生节气养生适宜?' },
  { name: '适宜', date: '5?5-7?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生适宜?' },
  { name: '适宜', date: '5?20-22?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜?,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生节气养生' },
  { name: '适宜', date: '6?5-7?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生?' },
  { name: '适宜', date: '6?21-22?', season: '?', desc: '节气养生节气养生节气养生适宜?', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生适宜' },
  { name: '适宜', date: '7?6-8?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生?' },
  { name: '适宜', date: '7?22-24?', season: '?', desc: '节气养生节气养生节气养生节气养生节气养生', foods: '适宜?,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生适宜?' },
  { name: '适宜', date: '8?7-9?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '?,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生适宜?' },
  { name: '适宜', date: '8?22-24?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '?,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '9?7-9?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '?,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '9?22-24?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜?', '适宜'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '10?7-9?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '10?23-24?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜?', '适宜', '适宜'], tips: '节气养生节气养生适宜?' },
  { name: '适宜', date: '11?7-8?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜?,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '11?22-23?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜?', '适宜'], tips: '节气养生节气养生适宜' },
  { name: '适宜', date: '12?6-8?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生适宜' },
  { name: '适宜', date: '12?21-23?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生' },
  { name: '适宜', date: '1?5-7?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜?'], tips: '节气养生节气养生适宜?' },
  { name: '适宜', date: '1?20-21?', season: '?', desc: '节气养生节气养生节气养生节气养生?', foods: '适宜,适宜,适宜,适宜'.split(','), points: ['适宜', '适宜', '适宜'], tips: '节气养生节气养生节气养生适宜' },
]

const defaultCurrentTerm = { name: '适宜', date: '10?23-24?', season: '?', desc: '节气养生节气养生节气养生节气养生', foods: '适宜,适宜,适宜,适宜'.split(','), points: '适宜?,适宜,适宜'.split(','), tips: '节气养生节气养生适宜?' }

export default function SolarTermPage() {
  const [loading, setLoading] = useState(false)
  const [solarTerms, setSolarTerms] = useState(defaultSolarTerms)
  const [selected, setSelected] = useState(defaultSolarTerms[17])

  useEffect(() => {
    setLoading(true)
    request.get('/solar-terms').then((res: any) => {
      const d = res.data || res
      if (d.list && d.current) {
        setSolarTerms(d.list)
        setSelected(d.current)
      } else if (d.list) {
        setSolarTerms(d.list)
      }
    }).catch(() => {
      message.error('节气养生节气养生节气养生适宜?')
    }).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <EnvironmentOutlined /> 节气养生适宜?
      </Title>

      <Alert message={`节气养生?${selected.name}?${selected.date}?`}
        description={selected.desc} type="success" showIcon style={{ marginBottom: 16 }} />

      <Row gutter={16}>
        <Col span={6}>
          <Card title="节气养生" size="small" style={{ height: 520, overflow: 'auto' }}>
            {['?', '?', '?', '?'].map(season => (
              <div key={season} style={{ marginBottom: 8 }}>
                <Text strong style={{ color: season === '?' ? '#27AE60' : season === '?' ? '#C0392B' : season === '?' ? '#E67E22' : '#5B8DEF' }}>
                  {season}?
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {solarTerms.filter(t => t.season === season).map(term => (
                    <Tag key={term.name} color={selected.name === term.name ? '#8B4513' : 'default'}
                      style={{ cursor: 'pointer', margin: 0 }}
                      onClick={() => setSelected(term)}>{term.name}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Col>

        <Col span={18}>
          <Card title={<Space><SunOutlined /> {selected.name}?{selected.date}?</Space>}
            style={{ marginBottom: 16 }}>
            <Alert message={selected.desc} type="info" showIcon style={{ marginBottom: 16 }} />
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title={<><CoffeeOutlined /> 节气养生</>}>
                  <Space wrap>
                    {selected.foods.map((f: string, idx: number) => (
                      <Tag key={idx} color="green" style={{ fontSize: 13, padding: '2px 8px' }}>{f}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<><MedicineBoxOutlined /> 节气养生</>}>
                  <Space wrap>
                    {selected.points.map((p: string, idx: number) => (
                      <Tag key={idx} color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>{p}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title={<><BookOutlined /> 节气养生</>}>
                  <Text>{selected.tips}</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title={`${selected.name}节气养生`}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#8B4513' }}>节气养生?</Text>
                <Text>{selected.desc}</Text>
              </div>
              <Divider />
              <div>
                <Text strong style={{ color: '#27AE60' }}>节气养生?</Text>
                <Space wrap style={{ marginTop: 4 }}>
                  {selected.foods.map((f: string, idx: number) => (
                    <Tag key={idx} color="green">{f}</Tag>
                  ))}
                </Space>
              </div>
              <Divider />
              <div>
                <Text strong style={{ color: '#5B8DEF' }}>节气养生适宜?</Text>
                <Space wrap style={{ marginTop: 4 }}>
                  {selected.points.map((p: string, idx: number) => (
                    <Tag key={idx} color="blue">{p}</Tag>
                  ))}
                </Space>
              </div>
              <Divider />
              <div>
                <Text strong style={{ color: '#E67E22' }}>节气养生?</Text>
                <Text>{selected.tips}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
    </Spin>
  )
}
