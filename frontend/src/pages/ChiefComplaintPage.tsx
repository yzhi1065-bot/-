import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Typography, Space, Select, Input, Button, List, Divider, message, Descriptions, Spin } from 'antd'
import { ThunderboltOutlined, MedicineBoxOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TextArea } = Input

const defaultBodyParts = [
  { key: 'head', label: '头部', symptoms: ['头痛', '头晕', '眩晕', '头重'] },
  { key: 'face', label: '面部', symptoms: ['面痛', '面肿', '面赤', '面白'] },
  { key: 'eye', label: '眼部', symptoms: ['目赤', '目涩', '视力模糊', '眼胀'] },
  { key: 'ear', label: '耳部', symptoms: ['耳鸣', '耳聋', '耳痛'] },
  { key: 'throat', label: '咽喉', symptoms: ['咽痛', '咽干', '异物感', '声音嘶哑'] },
  { key: 'chest', label: '胸部', symptoms: ['胸闷', '胸痛', '心悸', '胁痛'] },
  { key: 'abdomen', label: '腹部', symptoms: ['胃痛', '腹胀', '腹痛', '胁胀'] },
  { key: 'back', label: '腰背', symptoms: ['腰痛', '背痛', '腰酸', '腰膝酸软'] },
  { key: 'limbs', label: '四肢', symptoms: ['肢冷', '麻木', '关节痛', '水肿'] },
  { key: 'skin', label: '皮肤', symptoms: ['瘙痒', '皮疹', '黄染', '水肿'] },
]

const defaultCommonComplaints = {
  '感冒类': ['恶寒发热', '鼻塞流涕', '咳嗽咽痛', '头痛身痛'],
  '消化类': ['胃痛腹胀', '纳差食少', '便溏泄泻', '便秘'],
  '呼吸类': ['咳嗽气喘', '痰多胸闷', '咽喉肿痛'],
  '心神类': ['失眠多梦', '心烦易怒', '心悸不安', '健忘'],
  '妇科类': ['月经不调', '痛经', '带下异常'],
  '疼痛类': ['头痛', '胸痛', '胁痛', '胃痛', '腰痛', '关节痛'],
}

const timeModifiers = ['反复发作', '持续', '间歇性', '进行性加重', '突发']
const durationModifiers = ['1天', '3天', '1周', '2周', '1月', '3月', '半年', '1年']

export default function ChiefComplaintPage() {
  const [loading, setLoading] = useState(false)
  const [bodyParts, setBodyParts] = useState(defaultBodyParts)
  const [commonComplaints, setCommonComplaints] = useState(defaultCommonComplaints)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  const [result, setResult] = useState('')
  const [bodyPart, setBodyPart] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    request.get('/chief-complaints/symptoms').then((res: any) => {
      const d = res.data || res
      if (d.bodyParts) setBodyParts(d.bodyParts)
      if (d.commonComplaints) setCommonComplaints(d.commonComplaints)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
  }

  const generateComplaint = () => {
    if (selectedSymptoms.length === 0) {
      message.warning('请至少选择一个症状')
      return
    }
    const symptomStr = selectedSymptoms.join('、')
    const timeStr = selectedTime || ''
    const durationStr = selectedDuration || ''
    let complaint = symptomStr
    if (timeStr && durationStr) {
      complaint = `${symptomStr}${timeStr}${durationStr}`
    } else if (durationStr) {
      complaint = `${symptomStr}${durationStr}`
    }
    setResult(complaint)
    message.success('主诉已生成，可复制使用')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    message.success('已复制到剪贴板')
  }

  return (
    <div>
      <Spin spinning={loading}>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <ThunderboltOutlined /> 智能主诉录入
      </Title>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="按部位选择症状" style={{ marginBottom: 16 }}>
            <Select placeholder="选择身体部位" style={{ width: '100%', marginBottom: 16 }}
              value={bodyPart} onChange={setBodyPart}
              options={bodyParts.map(bp => ({ label: bp.label, value: bp.key }))}
            />
            {bodyPart && (
              <div>
                {bodyParts.find(bp => bp.key === bodyPart)?.symptoms.map((s, idx) => (
                  <Tag key={idx} color="blue" style={{ cursor: 'pointer', marginBottom: 4 }}
                    onClick={() => addSymptom(s)}>{s}</Tag>
                ))}
              </div>
            )}
          </Card>

          <Card title="按病症类别选择" style={{ marginBottom: 16 }}>
            {Object.entries(commonComplaints).map(([category, symptoms], idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <Text strong type="secondary" style={{ fontSize: 12 }}>{category}</Text>
                <div style={{ marginTop: 4 }}>
                  {symptoms.map((s, j) => (
                    <Tag key={j} style={{ cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => addSymptom(s)}>{s}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="修饰词" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 12 }}>发作特点：</Text>
              <div style={{ marginTop: 4 }}>
                {timeModifiers.map((m, idx) => (
                  <Tag key={idx} color={selectedTime === m ? 'red' : 'default'}
                    style={{ cursor: 'pointer' }} onClick={() => setSelectedTime(selectedTime === m ? '' : m)}>{m}</Tag>
                ))}
              </div>
            </div>
            <div>
              <Text strong style={{ fontSize: 12 }}>持续时间：</Text>
              <div style={{ marginTop: 4 }}>
                {durationModifiers.map((d, idx) => (
                  <Tag key={idx} color={selectedDuration === d ? 'red' : 'default'}
                    style={{ cursor: 'pointer' }} onClick={() => setSelectedDuration(selectedDuration === d ? '' : d)}>{d}</Tag>
                ))}
              </div>
            </div>
          </Card>

          <Card title="已选症状" style={{ marginBottom: 16 }}>
            {selectedSymptoms.length > 0 ? (
              <Space wrap>
                {selectedSymptoms.map((s, idx) => (
                  <Tag key={idx} closable onClose={() => removeSymptom(s)} color="blue">{s}</Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">请从左侧选择症状</Text>
            )}
            <Divider />
            <Space>
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={generateComplaint}>生成主诉</Button>
              <Button onClick={() => { setSelectedSymptoms([]); setResult('') }}>清空</Button>
            </Space>
          </Card>

          {result && (
            <Card title="主诉结果" style={{ borderLeft: '3px solid #8B4513' }}>
              <Text style={{ fontSize: 16, lineHeight: 2 }}>{result}</Text>
              <Divider />
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleCopy}>复制主诉</Button>
            </Card>
          )}

          <Card title="或手动输入" style={{ marginTop: 16 }}>
            <TextArea rows={3} placeholder="直接输入患者主诉..."
              onChange={(e) => setResult(e.target.value)} />
          </Card>
        </Col>
      </Row>
      </Spin>
    </div>
  )
}
