import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined, IdcardOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import { useAuthStore } from '../store/authStore'

const { Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form] = Form.useForm()

  const onLogin = async (values: any) => {
    setLoading(true)
    try {
      const res: any = await request.post(API_ENDPOINTS.LOGIN, values)
      setAuth(res.access_token, res.user)
      message.success(`欢迎回来，${res.user.real_name}！`)
      navigate('/dashboard', { replace: true })
    } catch { /* handled by interceptor */ }
    setLoading(false)
  }

  const onRegister = async (values: any) => {
    setLoading(true)
    try {
      await request.post(API_ENDPOINTS.REGISTER, values)
      message.success('注册成功，请登录')
      setShowRegister(false)
      form.resetFields()
      form.setFieldsValue({ username: values.username })
    } catch { /* handled by interceptor */ }
    setLoading(false)
  }

  const container: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: 'linear-gradient(135deg, #F5F0EB 0%, #E8D5C4 50%, #D4A574 100%)',
    position: 'relative', overflow: 'hidden',
  }
  const cardStyle: React.CSSProperties = {
    width: 440, borderRadius: 16, border: '1px solid rgba(139,69,19,0.10)',
    boxShadow: '0 8px 32px rgba(139,69,19,0.12)', background: 'rgba(255,255,255,0.97)',
    position: 'relative', zIndex: 1,
  }

  return (
    <div style={container}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(139,69,19,0.2)',
          }}>
            <span style={{ fontSize: 32, color: '#fff' }}>⚕</span>
          </div>
          <h1 style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 22, fontWeight: 900, color: '#8B4513', margin: 0, letterSpacing: 3 }}>
            {showRegister ? '注 册 新 账 号' : '中医智能诊断系统'}
          </h1>
          <Text type="secondary" style={{ fontSize: 12, letterSpacing: 1 }}>
            {showRegister ? '创建医生/管理员账号' : 'Intelligent TCM Diagnosis System'}
          </Text>
        </div>

        {!showRegister ? (
          <Form form={form} onFinish={onLogin} size="large" initialValues={{ username: 'admin', password: 'admin123' }}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名 / 工号" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{ height: 44, borderRadius: 8, fontSize: 16, letterSpacing: 4 }}>
                登 录
              </Button>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="default" block onClick={() => setShowRegister(true)}
                style={{ height: 36, borderRadius: 8 }}>
                注 册 新 账 号
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} onFinish={onRegister} size="large" layout="vertical">
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="登录用户名" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="real_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input prefix={<IdcardOutlined />} placeholder="真实姓名" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="设置密码" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="phone" label="手机号">
              <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Space style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading}
                style={{ flex: 1, height: 44, borderRadius: 8, fontSize: 16 }}>
                注 册
              </Button>
              <Button onClick={() => { setShowRegister(false); form.resetFields() }}
                style={{ height: 44, borderRadius: 8 }}>
                返回登录
              </Button>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  )
}
