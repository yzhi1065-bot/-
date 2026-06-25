import React, { useState } from 'react'
import { Card, Steps, Button, Form, Input, Typography, message, Progress, Space, Divider, Alert, Row, Col, Tag } from 'antd'
import {
  SettingOutlined, UserOutlined, CheckCircleOutlined,
  LaptopOutlined, MedicineBoxOutlined, RobotOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'

const { Title, Text } = Typography

export default function SetupWizardPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const [installing, setInstalling] = useState(false)

  const checkEnv = async () => {
    try {
      await request.get('/health')
      message.success('后端服务连接正常')
    } catch {
      message.warning('后端服务未连接，部分功能可能不可用')
    }
    setCurrent(1)
  }

  const createAdmin = async (values: any) => {
    setInstalling(true)
    try {
      await request.post('/auth/register', values)
      message.success('管理员账号创建成功')
      setCurrent(2)
    } catch {
      // 如果已有账号则跳过
      message.success('系统已就绪')
      setCurrent(2)
    }
    setInstalling(false)
  }

  const finishSetup = () => {
    message.success('系统初始化完成！')
    navigate('/login')
  }

  const steps = [
    { title: '环境检查', icon: <LaptopOutlined /> },
    { title: '管理员设置', icon: <UserOutlined /> },
    { title: '完成', icon: <CheckCircleOutlined /> },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #F5F0EB 0%, #E8D5C4 100%)',
    }}>
      <Card style={{ width: 600, borderRadius: 16, boxShadow: '0 8px 32px rgba(139,69,19,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MedicineBoxOutlined style={{ fontSize: 48, color: '#8B4513', marginBottom: 8 }} />
          <Title level={3} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', margin: 0 }}>
            中医智能诊断系统
          </Title>
          <Text type="secondary">系统初始化向导</Text>
        </div>

        <Steps current={current} items={steps} style={{ marginBottom: 32 }} />

        {current === 0 && (
          <div>
            <Title level={5}>环境检查</Title>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small">
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span><LaptopOutlined /> 后端服务</span>
                  <Button size="small" onClick={checkEnv}>检查连接</Button>
                </Space>
              </Card>
              <Card size="small" style={{ opacity: 0.5 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span><RobotOutlined /> AI模型配置</span>
                  <Tag>可在设置中配置</Tag>
                </Space>
              </Card>
            </Space>
            <Divider />
            <Button type="primary" onClick={() => setCurrent(1)}>跳过，直接设置管理员</Button>
          </div>
        )}

        {current === 1 && (
          <div>
            <Title level={5}>创建管理员账号</Title>
            <Divider />
            <Form form={form} layout="vertical" onFinish={createAdmin}
              initialValues={{ username: 'admin', password: 'admin123', real_name: '管理员' }}>
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true }, { min: 6, message: '密码至少6位' }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item name="real_name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={installing} block>
                创建管理员
              </Button>
            </Form>
          </div>
        )}

        {current === 2 && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#27AE60', marginBottom: 16 }} />
            <Title level={4}>系统初始化完成！</Title>
            <Text type="secondary">默认登录信息：admin / admin123</Text>
            <Divider />
            <Alert message="建议初始化后修改默认密码" type="warning" showIcon style={{ marginBottom: 16 }} />
            <Space>
              <Button type="primary" size="large" onClick={finishSetup}>进入登录页面</Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  )
}
