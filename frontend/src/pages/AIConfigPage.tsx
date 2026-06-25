import React, { useState } from 'react'
import { Card, Form, Select, Input, Button, Typography, message, Space, Tag, Divider, Alert, Row, Col } from 'antd'
import { RobotOutlined, SettingOutlined, CheckOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text, Paragraph } = Typography

export default function AIConfigPage() {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  // 加载上次保存的配置
  React.useEffect(() => {
    const saved = localStorage.getItem('ai_config')
    if (saved) {
      try {
        form.setFieldsValue(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      // 保存到本地
      localStorage.setItem('ai_config', JSON.stringify(values))
      // 也发到后端保存
      try {
        await request.put('/api/ai-config', values)
      } catch {}
      message.success('配置已保存！选择"在线模式"后，诊断将使用真实AI')
    } catch (e) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, fontFamily: '"Noto Serif SC", serif', color: '#8B4513' }}>
        <RobotOutlined /> AI 模型配置
      </Title>
      <Row gutter={16}>
        <Col span={16}>
          <Card title="AI推理引擎配置">
            <Alert message="无需配置也可使用" description="系统内置了模拟诊断数据，不配置API也可完整演示所有功能。" type="info" showIcon style={{ marginBottom: 24 }} />
            <Form form={form} layout="vertical" onFinish={handleSave}
              initialValues={{ mode: 'demo', provider: 'deepseek', api_key: '', api_url: 'https://api.deepseek.com', model: 'deepseek-chat', temperature: 0.3 }}
            >
              <Form.Item name="mode" label="运行模式">
                <Select onChange={(val) => {
                  if (val === 'demo') {
                    form.setFieldsValue({ mode: 'demo' })
                    handleSave({ ...form.getFieldsValue(), mode: 'demo' })
                  }
                }}>
                  <Select.Option value="demo">演示模式（使用内置模拟数据）</Select.Option>
                  <Select.Option value="online">在线模式（连接真实AI大模型）</Select.Option>
                </Select>
              </Form.Item>
              <Divider>在线模式配置</Divider>
              <Form.Item name="provider" label="AI提供商">
                <Select>
                  <Select.Option value="deepseek">DeepSeek（深度求索）</Select.Option>
                  <Select.Option value="openai">OpenAI（GPT-4o）</Select.Option>
                  <Select.Option value="qwen">通义千问（阿里云）</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="api_url" label="API地址">
                <Input placeholder="https://api.deepseek.com" />
              </Form.Item>
              <Form.Item name="api_key" label="API Key">
                <Input.Password placeholder="sk-..." />
              </Form.Item>
              <Form.Item name="model" label="模型名称">
                <Input placeholder="deepseek-chat / gpt-4o" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} icon={<CheckOutlined />}>保存配置</Button>
            </Form>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="支持模型">
            <Space direction="vertical" key="models" style={{ width: '100%' }}>
              <Card size="small"><Space><Tag color="blue">DeepSeek</Tag><Text>deepseek-chat</Text></Space></Card>
              <Card size="small"><Space><Tag color="green">通义千问</Tag><Text>qwen-max</Text></Space></Card>
              <Card size="small"><Space><Tag color="orange">GPT-4o</Tag><Text>gpt-4o</Text></Space></Card>
            </Space>
          </Card>
          <Card title="快速注册" style={{ marginTop: 16 }}>
            <Space direction="vertical" key="models" style={{ width: '100%' }}>
              <Button block onClick={() => window.open('https://platform.deepseek.com', '_blank')}>注册 DeepSeek</Button>
              <Button block onClick={() => window.open('https://dashscope.aliyun.com', '_blank')}>注册 通义千问</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
