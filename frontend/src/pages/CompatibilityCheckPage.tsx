import React, { useState, useEffect } from 'react'
import { Card, Input, Tag, Typography, Alert, Table, Space, Divider, Button, message, Badge, Spin } from 'antd'
import { WarningOutlined, CheckCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text, Paragraph } = Typography

// 十八反十九畏数据
const defaultEighteenOpposites = [
  { group: '乌头（川乌、草乌、附子）', opposes: '半夏、瓜蒌（全瓜蒌、瓜蒌皮、瓜蒌仁）、贝母（川贝、浙贝）、白蔹、白及', risk: '高', detail: '乌头反半夏、瓜蒌、贝母、白蔹、白及' },
  { group: '甘草', opposes: '甘遂、大戟、海藻、芫花', risk: '高', detail: '甘草反甘遂、大戟、海藻、芫花' },
  { group: '藜芦', opposes: '人参、沙参、丹参、玄参、细辛、芍药', risk: '高', detail: '藜芦反人参、沙参、丹参、玄参、细辛、芍药' },
]

const defaultNineteenFears = [
  { group: '硫黄', opposes: '朴硝（芒硝）', risk: '中', detail: '硫黄畏朴硝' },
  { group: '水银', opposes: '砒霜', risk: '高', detail: '水银畏砒霜' },
  { group: '狼毒', opposes: '密陀僧', risk: '中', detail: '狼毒畏密陀僧' },
  { group: '巴豆', opposes: '牵牛子', risk: '中', detail: '巴豆畏牵牛子' },
  { group: '丁香', opposes: '郁金', risk: '中', detail: '丁香畏郁金' },
  { group: '牙硝', opposes: '三棱', risk: '中', detail: '牙硝畏三棱' },
  { group: '川乌、草乌', opposes: '犀角（水牛角代）', risk: '中', detail: '川乌、草乌畏犀角' },
  { group: '人参', opposes: '五灵脂', risk: '中', detail: '人参畏五灵脂' },
  { group: '官桂（肉桂）', opposes: '赤石脂', risk: '中', detail: '官桂畏赤石脂' },
]

const defaultPregnantProhibited = [
  '斑蝥', '水蛭', '虻虫', '三棱', '莪术', '麝香', '牵牛子', '巴豆',
  '甘遂', '大戟', '芫花', '商陆', '轻粉', '雄黄', '砒石',
]

const defaultHerbList2 = [
  '制附子', '干姜', '党参', '炒白术', '茯苓', '苍术', '厚朴', '陈皮', '炙甘草', '砂仁',
  '柴胡', '当归', '白芍', '薄荷', '黄芪', '川芎', '桃仁', '红花', '半夏', '瓜蒌',
]

export default function CompatibilityCheckPage() {
  const [loading, setLoading] = useState(false)
  const [eighteenOpposites, setEighteenOpposites] = useState(defaultEighteenOpposites)
  const [nineteenFears, setNineteenFears] = useState(defaultNineteenFears)
  const [pregnantProhibited, setPregnantProhibited] = useState(defaultPregnantProhibited)
  const [herbInput, setHerbInput] = useState('')
  const [result, setResult] = useState<{ safe: boolean; issues: string[] } | null>(null)

  useEffect(() => {
    setLoading(true)
    request.get('/compatibility/references').then((res: any) => {
      const d = res.data || res
      if (d.eighteenOpposites) setEighteenOpposites(d.eighteenOpposites)
      if (d.nineteenFears) setNineteenFears(d.nineteenFears)
      if (d.pregnantProhibited) setPregnantProhibited(d.pregnantProhibited)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCheck = () => {
    const herbs = herbInput.split(/[,，、\s]+/).filter(Boolean)
    if (herbs.length < 2) {
      message.warning('请至少输入2味药')
      return
    }

    const issues: string[] = []

    // 检查十八反
    for (const item of eighteenOpposites) {
      const hasGroup = item.group.includes('（')
        ? herbs.some(h => item.group.includes(h.replace('（', '(').split('（')[0]))
        : herbs.includes(item.group)
      if (!hasGroup) continue
      const opposeList = item.opposes.split('、').map(h => h.replace(/[（(].*[）)]/g, '').trim())
      for (const opp of opposeList) {
        if (herbs.some(h => h.includes(opp))) {
          issues.push(`⚠️ 十八反：${item.detail}（${item.risk}风险）`)
        }
      }
    }

    // 检查十九畏
    for (const item of nineteenFears) {
      const groupNames = item.group.split('、').map(g => g.trim())
      const hasGroup = groupNames.some(g => herbs.some(h => h.includes(g)))
      if (!hasGroup) continue
      const opposeList = item.opposes.split('、').map(h => h.trim())
      for (const opp of opposeList) {
        if (herbs.some(h => h.includes(opp))) {
          issues.push(`⚠️ 十九畏：${item.detail}（${item.risk}风险）`)
        }
      }
    }

    // 检查孕妇禁忌
    for (const herb of herbs) {
      if (pregnantProhibited.some(p => herb.includes(p))) {
        issues.push(`🔴 ${herb} 为孕妇禁用/慎用药，请特别注意！`)
      }
    }

    setResult({ safe: issues.length === 0, issues })
    if (issues.length === 0) {
      message.success('✅ 未检出配伍禁忌')
    }
  }

  const handleQuickSelect = (herbs: string[]) => {
    setHerbInput(herbs.join('、'))
  }

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <MedicineBoxOutlined /> 方剂配伍禁忌检查
      </Title>

      <Card title="输入处方进行配伍检查" style={{ marginBottom: 16 }}>
        <Input.TextArea
          value={herbInput}
          onChange={(e) => setHerbInput(e.target.value)}
          placeholder="输入药物名称，用逗号或空格分隔&#10;例如：制附子 半夏 甘草 甘遂"
          rows={3}
          style={{ marginBottom: 12 }}
        />
        <Space>
          <Button type="primary" onClick={handleCheck}>检查配伍禁忌</Button>
          <Button onClick={() => { setHerbInput(''); setResult(null) }}>清空</Button>
        </Space>

        <Divider />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>快速选择测试方剂：</Text>
        <Space wrap>
          <Button size="small" onClick={() => handleQuickSelect(['制附子', '半夏', '干姜', '党参', '炙甘草'])}>
            含十八反测试方
          </Button>
          <Button size="small" onClick={() => handleQuickSelect(['人参', '五灵脂', '当归', '白术'])}>
            含十九畏测试方
          </Button>
          <Button size="small" onClick={() => handleQuickSelect(['党参', '白术', '茯苓', '甘草'])}>
            安全方剂示例
          </Button>
        </Space>
      </Card>
      </Spin>

      {result && (
        <Card title="检查结果" style={{ marginBottom: 16 }}>
          <Alert
            type={result.safe ? 'success' : 'error'}
            showIcon
            message={result.safe ? '✅ 未检出配伍禁忌，处方安全' : `⚠️ 发现 ${result.issues.length} 个配伍问题`}
            description={result.safe ? '该处方配伍合理，可安全使用' : undefined}
          />
          {!result.safe && (
            <ul style={{ marginTop: 16 }}>
              {result.issues.map((issue, idx) => (
                <li key={idx}>
                  <Tag color="red" style={{ marginBottom: 4 }}>{issue}</Tag>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Card title="十八反十九畏参考">
        <Alert message="配伍禁忌是中药方剂安全性的重要保障，建议医生开方时仔细核对" type="info" showIcon style={{ marginBottom: 16 }} />

        <Title level={5} style={{ color: '#C0392B' }}>十八反</Title>
        {eighteenOpposites.map((item, idx) => (
          <Card key={idx} size="small" style={{ marginBottom: 8 }}>
            <Space>
              <Tag color="red" style={{ fontWeight: 600 }}>{item.group}</Tag>
              <Text type="secondary">反</Text>
              <Text strong>{item.opposes}</Text>
              <Badge count={item.risk === '高' ? '高风险' : '中风险'} style={{ backgroundColor: item.risk === '高' ? '#C0392B' : '#E67E22' }} />
            </Space>
          </Card>
        ))}

        <Divider />
        <Title level={5} style={{ color: '#E67E22' }}>十九畏</Title>
        {nineteenFears.map((item, idx) => (
          <Card key={idx} size="small" style={{ marginBottom: 8 }}>
            <Space>
              <Tag color="orange" style={{ fontWeight: 600 }}>{item.group}</Tag>
              <Text type="secondary">畏</Text>
              <Text strong>{item.opposes}</Text>
            </Space>
          </Card>
        ))}

        <Divider />
        <Title level={5} style={{ color: '#C0392B' }}>孕妇禁用/慎用药</Title>
        <Space wrap>
          {pregnantProhibited.map((h, idx) => (
            <Tag key={idx} color="red">{h}</Tag>
          ))}
        </Space>
      </Card>
    </div>
  )
}
