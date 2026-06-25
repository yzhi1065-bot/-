import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Typography, Space, List, Divider, Timeline, Alert, Tabs, Button, message, Spin } from 'antd'
import request from '../services/http'
import {
  HeartOutlined, MedicineBoxOutlined, FireOutlined,
  CoffeeOutlined, SmileOutlined, MoonOutlined,
  CheckCircleOutlined, StarOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultConstitutionAdvice: Record<string, any> = {
  '阳虚质': {
    diet: '宜温阳补气，多吃牛羊肉、生姜、韭菜、核桃、桂圆等温热食物。忌生冷寒凉，少食西瓜、梨、苦瓜。',
    exercise: '宜柔和运动，如太极拳、八段锦、慢跑。避免大量出汗的运动。',
    emotion: '保持积极乐观，多晒太阳。阳虚者易情绪低落，宜多与人交流。',
    routine: '早睡晚起，避寒就温。睡前用热水泡脚。注意腹部、腰部和脚部保暖。',
    season: '春夏养阳，夏季是三伏天艾灸最佳时期。冬季注意保暖。',
  },
  '阴虚质': {
    diet: '宜滋阴清热，多吃百合、银耳、梨、鸭肉、甲鱼。忌辛辣燥热，少食羊肉、辣椒。',
    exercise: '宜中小强度运动，如游泳、瑜伽。避免高温环境运动。',
    emotion: '宜静养心神，避免烦躁。可听轻音乐、练习书法绘画。',
    routine: '早睡早起，保证充足睡眠。避免熬夜，熬夜最耗阴液。',
    season: '秋冬养阴，秋季宜食梨、百合润燥。夏季避暑养阴。',
  },
  '气虚质': {
    diet: '宜补气健脾，多吃山药、黄芪、大枣、小米、鸡肉。忌生冷耗气食物。',
    exercise: '宜适量运动，循序渐进。推荐散步、八段锦。避免剧烈运动。',
    emotion: '宜静养，避免过度思虑。气虚者易疲劳，注意劳逸结合。',
    routine: '规律作息，避免熬夜。适当午休，不宜过劳。',
    season: '春季养气，宜食春笋、豆芽。夏季避暑防暑耗气。',
  },
  '平和质': {
    diet: '均衡饮食，五谷杂粮、蔬菜水果适量即可。',
    exercise: '保持规律运动习惯即可。',
    emotion: '保持良好心态即可。',
    routine: '保持现有健康作息。',
    season: '顺应四季变化即可。',
  },
}

const defaultSeasonalTips: Record<string, any> = {
  '春': { title: '春季养生', content: '春三月，此谓发陈。夜卧早起，广步于庭。宜疏肝理气，多吃绿色蔬菜，保持心情舒畅。', foods: ['春笋', '菠菜', '韭菜', '荠菜', '豆芽'], points: ['太冲', '足三里', '肝俞'] },
  '夏': { title: '夏季养生', content: '夏三月，此谓蕃秀。夜卧早起，无厌于日。宜清热解暑，养心安神，适当出汗。', foods: ['绿豆', '冬瓜', '苦瓜', '西瓜', '荷叶'], points: ['内关', '神门', '足三里'] },
  '秋': { title: '秋季养生', content: '秋三月，此谓容平。早卧早起，与鸡俱兴。宜滋阴润肺，收敛神气，少食辛辣。', foods: ['梨', '百合', '银耳', '山药', '莲藕'], points: ['太渊', '肺俞', '列缺'] },
  '冬': { title: '冬季养生', content: '冬三月，此谓闭藏。早卧晚起，必待日光。宜温补肾阳，适当进补，避寒就温。', foods: ['羊肉', '核桃', '黑芝麻', '桂圆', '生姜'], points: ['关元', '命门', '肾俞'] },
}

export default function HealthAdvicePage() {
  const [loading, setLoading] = useState(false)
  const [constitutionAdvice, setConstitutionAdvice] = useState(defaultConstitutionAdvice)
  const [seasonalTips, setSeasonalTips] = useState(defaultSeasonalTips)
  const [constitution, setConstitution] = useState('阳虚质')
  const [season, setSeason] = useState('冬')

  useEffect(() => {
    setLoading(true)
    request.get('/health-advice').then((res: any) => {
      const d = res.data || res
      if (d.constitution) setConstitutionAdvice(d.constitution)
      if (d.seasonalTips) setSeasonalTips(d.seasonalTips)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const advices = [
    { category: '饮食调理', icon: <CoffeeOutlined />, content: constitutionAdvice[constitution]?.diet || '' },
    { category: '运动指导', icon: <FireOutlined />, content: constitutionAdvice[constitution]?.exercise || '' },
    { category: '情志调节', icon: <SmileOutlined />, content: constitutionAdvice[constitution]?.emotion || '' },
    { category: '起居作息', icon: <MoonOutlined />, content: constitutionAdvice[constitution]?.routine || '' },
    { category: '四季调养', icon: <StarOutlined />, content: constitutionAdvice[constitution]?.season || '' },
  ]

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <HeartOutlined /> 个性化健康建议
      </Title>

      <Tabs defaultActiveKey="personal">
        <TabPane tab="个性化建议" key="personal">
          <Row gutter={16}>
            <Col span={6}>
              <Card title="选择体质" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {['平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'].map(t => (
                    <Button key={t} type={constitution === t ? 'primary' : 'default'} block
                      onClick={() => setConstitution(t)}>{t}</Button>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col span={18}>
              <div style={{ marginBottom: 16 }}>
                <Alert message={`基于 ${constitution} 的个性化健康方案`}
                  description={constitutionAdvice[constitution]?.season || ''}
                  type="info" showIcon />
              </div>
              {advices.map((advice, idx) => (
                <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                  <Space>
                    <span style={{ fontSize: 20, color: '#8B4513' }}>{advice.icon}</span>
                    <Text strong>{advice.category}</Text>
                  </Space>
                  <div style={{ marginTop: 8, paddingLeft: 32 }}>
                    <Text>{advice.content}</Text>
                  </div>
                </Card>
              ))}
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="节气养生" key="season">
          <Row gutter={16}>
            {['春', '夏', '秋', '冬'].map(s => (
              <Col span={6} key={s}>
                <Card hoverable={true}
                  style={{
                    cursor: 'pointer', textAlign: 'center',
                    border: season === s ? '2px solid #8B4513' : '1px solid #f0f0f0',
                  }}
                  onClick={() => setSeason(s)}
                >
                  <Tag color={s === '春' ? 'green' : s === '夏' ? 'red' : s === '秋' ? 'orange' : 'blue'}
                    style={{ fontSize: 16, padding: '4px 16px' }}>
                    {s}
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
          <Card title={seasonalTips[season]?.title} style={{ marginTop: 16 }}>
            <Alert message="养生要点" description={seasonalTips[season]?.content} type="success" showIcon />
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>推荐食材：</Text>
                <div style={{ marginTop: 8 }}>
                  {seasonalTips[season]?.foods?.map((f: string, idx: number) => (
                    <Tag key={idx} color="green" style={{ marginBottom: 4 }}>{f}</Tag>
                  ))}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>推荐穴位：</Text>
                <div style={{ marginTop: 8 }}>
                  {seasonalTips[season]?.points?.map((p: string, idx: number) => (
                    <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>{p}</Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </Spin>
    </div>
  )
}
