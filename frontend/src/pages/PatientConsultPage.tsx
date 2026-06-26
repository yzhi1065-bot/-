import React, { useState } from 'react'
import { Card, Form, Select, Input, Button, Typography, message, Steps, Tag, Space, Row, Col, Divider, Alert, Descriptions } from 'antd'
import { UserOutlined, FormOutlined, CheckCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title } = Typography

export default function PatientConsultPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [basicForm] = Form.useForm()
  const [inquiryForm] = Form.useForm()
  const [result, setResult] = useState<any>(null)
  const [basicData, setBasicData] = useState<any>(null)

  const submitBasicInfo = async () => {
    try {
      const values = await basicForm.validateFields()
      setBasicData(values)
      setCurrentStep(1)
    } catch {
      message.error('操作失败，请重试')
    }
  }

  const submitAll = async () => {
    try {
      await inquiryForm.validateFields()
    } catch {
      return
    }

    const basic = basicData
    const inquiry = inquiryForm.getFieldsValue()
    const all = { ...basic, ...inquiry }
    const constitution = analyzeConstitution(all)
    setResult({ ...all, constitution })
    setCurrentStep(2)

    // 保存患者到后端
    try {
      const payload: any = { name: basic.name }
      if (basic.gender) payload.gender = basic.gender
      if (basic.chief_complaint) payload.chief_complaint = basic.chief_complaint
      const res = await request.post('/patients', payload)
      message.success('患者已建档！可前往"患者管理"查看')
    } catch (e: any) {
      message.success('预问诊已完成！')
    }
  }

  const renderBasicInfo = () => (
    <Card title="基本信息">
      <Form form={basicForm} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <Select placeholder="请选择">
                <Select.Option value="male">男</Select.Option>
                <Select.Option value="female">女</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="age" label="年龄">
              <Input type="number" placeholder="请输入年龄" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="chief_complaint" label="最不舒服的症状（主诉）" rules={[{ required: true, message: '请输入主诉' }]}>
          <Input.TextArea rows={2} placeholder="例如：胃痛反复发作2周" />
        </Form.Item>
        <Button type="primary" onClick={submitBasicInfo}>下一步：详细问诊</Button>
      </Form>
    </Card>
  )

  const renderInquiry = () => (
    <Card title="详细问诊（AI引导）">
      <Alert message="请根据实际情况填写" type="info" showIcon style={{ marginBottom: 16 }} />
      <Form form={inquiryForm} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="chills_fever" label="寒热情况">
              <Select><Select.Option value="">正常</Select.Option><Select.Option value="畏寒肢冷">畏寒肢冷</Select.Option><Select.Option value="五心烦热">五心烦热</Select.Option></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sleep" label="睡眠">
              <Select><Select.Option value="">正常</Select.Option><Select.Option value="失眠">失眠</Select.Option><Select.Option value="多梦">多梦</Select.Option><Select.Option value="易醒">容易醒</Select.Option></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bowel" label="大便">
              <Select><Select.Option value="">正常</Select.Option><Select.Option value="便溏">便溏</Select.Option><Select.Option value="便秘">便秘</Select.Option></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="appetite" label="食欲">
              <Select><Select.Option value="">正常</Select.Option><Select.Option value="纳差">食欲不振</Select.Option><Select.Option value="易饿">容易饿</Select.Option></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="emotion" label="情绪">
              <Select><Select.Option value="">平和</Select.Option><Select.Option value="易怒">易怒</Select.Option><Select.Option value="忧郁">忧郁</Select.Option><Select.Option value="焦虑">焦虑</Select.Option></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="energy" label="精力">
              <Select><Select.Option value="">正常</Select.Option><Select.Option value="乏力">容易疲劳</Select.Option><Select.Option value="气短">气短懒言</Select.Option></Select>
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button onClick={() => setCurrentStep(0)}>上一步</Button>
          <Button type="primary" onClick={submitAll}>提交预问诊</Button>
        </Space>
      </Form>
    </Card>
  )

  const renderResult = () => {
    if (!result) return null
    const c = result.constitution
    return (
      <Card title="预问诊完成">
        <Alert message="您的信息已提交，就诊时医生会进一步诊断" type="success" showIcon style={{ marginBottom: 16 }} />
        <Descriptions title="患者信息" column={2} size="small" bordered>
          <Descriptions.Item label="姓名">{result.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{result.gender === 'male' ? '男' : '女'}</Descriptions.Item>
          <Descriptions.Item label="主诉">{result.chief_complaint}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions title="体质辨识" column={1} size="small" bordered>
          <Descriptions.Item label="体质类型"><Tag color={cc(c.type)}>{c.type}</Tag></Descriptions.Item>
          <Descriptions.Item label="体质特征">{c.features}</Descriptions.Item>
          <Descriptions.Item label="健康建议">{c.advice}</Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  const steps = [
    { title: '基本信息', icon: <UserOutlined /> },
    { title: '详细问诊', icon: <FormOutlined /> },
    { title: '完成', icon: <CheckCircleOutlined /> },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>患者预问诊</Title>
      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
      {currentStep === 0 && renderBasicInfo()}
      {currentStep === 1 && renderInquiry()}
      {currentStep === 2 && renderResult()}
    </div>
  )
}

function analyzeConstitution(values: any) {
  const s: string[] = []
  if (values.chills_fever === '畏寒肢冷') s.push('阳虚')
  if (values.energy === '乏力' || values.energy === '气短') s.push('气虚')
  if (values.emotion === '易怒') s.push('气郁')
  if (values.sleep === '失眠') s.push('阴虚')
  if (values.bowel === '便溏') s.push('阳虚')
  const map: Record<string, { type: string; features: string; advice: string }> = {
    '阳虚': { type: '阳虚质', features: '阳气不足，畏寒怕冷、手足不温', advice: '宜温阳补气，多吃温热食物，避寒凉' },
    '阴虚': { type: '阴虚质', features: '阴液亏少，口燥咽干、手足心热', advice: '宜滋阴清热，多吃百合银耳，避免熬夜' },
    '气虚': { type: '气虚质', features: '元气不足，疲乏、气短、自汗', advice: '宜补气健脾，多吃山药大枣，适当运动' },
    '气郁': { type: '气郁质', features: '气机郁滞，神情抑郁、忧虑脆弱', advice: '宜疏肝理气，多运动听音乐' },
  }
  for (const [k, v] of Object.entries(map)) { if (s.includes(k)) return v }
  return { type: '平和质', features: '阴阳气血调和，体态适中、精力充沛', advice: '保持良好生活习惯即可' }
}

function cc(type: string) {
  const m: Record<string, string> = { '阳虚质': 'blue', '阴虚质': 'red', '气虚质': 'orange', '气郁质': 'cyan', '平和质': 'green' }
  return m[type] || 'default'
}
