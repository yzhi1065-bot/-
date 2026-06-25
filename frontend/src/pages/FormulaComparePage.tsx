import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Tag, Typography, Table, Space, Divider, Descriptions, Empty, Spin, message } from 'antd'
import { SwapOutlined, MedicineBoxOutlined, BookOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

const defaultFormulaLibrary = [
  { id: 1, name: '附子理中汤', source: '伤寒论', herbs: '制附子 干姜 党参 白术 炙甘草', efficacy: '温中祛寒，补气健脾', ruler: '制附子', minister: '干姜', assistant: '党参', servant: '白术、炙甘草' },
  { id: 2, name: '逍遥散', source: '局方', herbs: '柴胡 当归 白芍 白术 茯苓 甘草 薄荷', efficacy: '疏肝解郁，养血健脾', ruler: '柴胡', minister: '当归、白芍', assistant: '白术、茯苓', servant: '甘草、薄荷' },
  { id: 3, name: '六味地黄丸', source: '小儿药证直诀', herbs: '熟地黄 山茱萸 山药 泽泻 牡丹皮 茯苓', efficacy: '滋阴补肾', ruler: '熟地黄', minister: '山茱萸、山药', assistant: '泽泻、牡丹皮', servant: '茯苓' },
  { id: 4, name: '补中益气汤', source: '脾胃论', herbs: '黄芪 党参 白术 炙甘草 当归 陈皮 升麻 柴胡', efficacy: '补中益气，升阳举陷', ruler: '黄芪', minister: '党参、白术', assistant: '当归、陈皮', servant: '升麻、柴胡、甘草' },
  { id: 5, name: '血府逐瘀汤', source: '医林改错', herbs: '桃仁 红花 当归 生地 牛膝 柴胡 枳壳 赤芍 川芎 桔梗 甘草', efficacy: '活血化瘀，行气止痛', ruler: '桃仁、红花', minister: '当归、生地、牛膝', assistant: '柴胡、枳壳、赤芍', servant: '川芎、桔梗、甘草' },
  { id: 6, name: '四君子汤', source: '太平惠民和剂局方', herbs: '党参 白术 茯苓 甘草', efficacy: '益气健脾', ruler: '党参', minister: '白术', assistant: '茯苓', servant: '甘草' },
]

export default function FormulaComparePage() {
  const [loading, setLoading] = useState(false)
  const [formulaLibrary, setFormulaLibrary] = useState(defaultFormulaLibrary)
  const [formula1, setFormula1] = useState<number | null>(null)
  const [formula2, setFormula2] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    request.get('/formulas').then((res: any) => {
      const d = res.data || res
      if (d.list) setFormulaLibrary(d.list)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const f1 = formulaLibrary.find(f => f.id === formula1)
  const f2 = formulaLibrary.find(f => f.id === formula2)

  const getHerbs1 = () => f1?.herbs.split(' ').filter(Boolean) || []
  const getHerbs2 = () => f2?.herbs.split(' ').filter(Boolean) || []

  const commonHerbs = () => {
    if (!f1 || !f2) return []
    const h1 = getHerbs1()
    const h2 = getHerbs2()
    return h1.filter(h => h2.includes(h))
  }

  const uniqueHerbs1 = () => {
    if (!f1 || !f2) return []
    return getHerbs1().filter(h => !getHerbs2().includes(h))
  }

  const uniqueHerbs2 = () => {
    if (!f1 || !f2) return []
    return getHerbs2().filter(h => !getHerbs1().includes(h))
  }

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SwapOutlined /> 方剂对比分析
      </Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24} align="middle">
          <Col span={10}>
            <Text strong>方剂A：</Text>
            <Select showSearch placeholder="选择第一个方剂" style={{ width: '100%', marginTop: 8 }}
              value={formula1} onChange={setFormula1}
              filterOption={(input, option) => (option?.label as string || '').includes(input)}
              options={formulaLibrary.map(f => ({ label: `${f.name}（${f.source}）`, value: f.id }))}
            />
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <SwapOutlined style={{ fontSize: 28, color: '#D4A574' }} />
            <div><Text type="secondary">VS</Text></div>
          </Col>
          <Col span={10}>
            <Text strong>方剂B：</Text>
            <Select showSearch placeholder="选择第二个方剂" style={{ width: '100%', marginTop: 8 }}
              value={formula2} onChange={setFormula2}
              filterOption={(input, option) => (option?.label as string || '').includes(input)}
              options={formulaLibrary.map(f => ({ label: `${f.name}（${f.source}）`, value: f.id }))}
            />
          </Col>
        </Row>
      </Card>
      </Spin>

      {f1 && f2 && (
        <Row gutter={16}>
          <Col span={12}>
            <Card title={<span style={{ color: '#8B4513' }}>{f1.name}</span>}
              style={{ borderLeft: '3px solid #8B4513', marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="出处">{f1.source}</Descriptions.Item>
                <Descriptions.Item label="功效">{f1.efficacy}</Descriptions.Item>
              </Descriptions>
              <Divider />
              <Text strong style={{ color: '#C0392B' }}>君：</Text><Text>{f1.ruler}</Text>
              <div><Text strong style={{ color: '#E67E22' }}>臣：</Text><Text>{f1.minister}</Text></div>
              <div><Text strong style={{ color: '#5B8DEF' }}>佐：</Text><Text>{f1.assistant}</Text></div>
              <div><Text strong style={{ color: '#27AE60' }}>使：</Text><Text>{f1.servant}</Text></div>
              <Divider />
              <Space wrap>
                {getHerbs1().map((h, idx) => (
                  <Tag key={idx} color={getHerbs2().includes(h) ? 'green' : 'default'}>{h}</Tag>
                ))}
              </Space>
              <div style={{ marginTop: 8 }}><Tag color="green">● 绿色为两方共有</Tag></div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<span style={{ color: '#8B4513' }}>{f2.name}</span>}
              style={{ borderLeft: '3px solid #D4A574', marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="出处">{f2.source}</Descriptions.Item>
                <Descriptions.Item label="功效">{f2.efficacy}</Descriptions.Item>
              </Descriptions>
              <Divider />
              <Text strong style={{ color: '#C0392B' }}>君：</Text><Text>{f2.ruler}</Text>
              <div><Text strong style={{ color: '#E67E22' }}>臣：</Text><Text>{f2.minister}</Text></div>
              <div><Text strong style={{ color: '#5B8DEF' }}>佐：</Text><Text>{f2.assistant}</Text></div>
              <div><Text strong style={{ color: '#27AE60' }}>使：</Text><Text>{f2.servant}</Text></div>
              <Divider />
              <Space wrap>
                {getHerbs2().map((h, idx) => (
                  <Tag key={idx} color={getHerbs1().includes(h) ? 'green' : 'default'}>{h}</Tag>
                ))}
              </Space>
              <div style={{ marginTop: 8 }}><Tag color="green">● 绿色为两方共有</Tag></div>
            </Card>
          </Col>
        </Row>
      )}

      {f1 && f2 && (
        <Card title="对比分析结果">
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="共同药物" style={{ borderLeft: '3px solid #27AE60', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#27AE60' }}>{commonHerbs().length}</div>
                <Text type="secondary">味药物相同</Text>
                {commonHerbs().length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      {commonHerbs().map((h, idx) => <Tag key={idx} color="green">{h}</Tag>)}
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="方剂A独有" style={{ borderLeft: '3px solid #8B4513', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#8B4513' }}>{uniqueHerbs1().length}</div>
                <Text type="secondary">味</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>{uniqueHerbs1().map((h, idx) => <Tag key={idx}>{h}</Tag>)}</Space>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="方剂B独有" style={{ borderLeft: '3px solid #D4A574', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#D4A574' }}>{uniqueHerbs2().length}</div>
                <Text type="secondary">味</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>{uniqueHerbs2().map((h, idx) => <Tag key={idx} color="orange">{h}</Tag>)}</Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {(!f1 || !f2) && (
        <Card>
          <Empty description="请选择两个方剂进行对比" />
        </Card>
      )}
    </div>
  )
}
