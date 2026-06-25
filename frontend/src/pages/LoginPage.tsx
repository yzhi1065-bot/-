import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import { useAuthStore } from '../store/authStore'

const { Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res: any = await request.post(API_ENDPOINTS.LOGIN, values)
      setAuth(res.access_token, res.user)
      message.success(`欢迎回来，${res.user.real_name}！`)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #F5F0EB 0%, #E8D5C4 50%, #D4A574 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装饰性水墨背景 */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,69,19,0.04) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%)',
      }} />

      <Card style={{
        width: 420,
        borderRadius: 16,
        border: '1px solid rgba(139,69,19,0.10)',
        boxShadow: '0 8px 32px rgba(139,69,19,0.12)',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        padding: '8px 0',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* Logo 区域 */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(139,69,19,0.2)',
          }}>
            <span style={{ fontSize: 36, color: '#fff' }}>⚕</span>
          </div>
          <h1 style={{
            fontFamily: '"Noto Serif SC", "SimSun", serif',
            fontSize: 24,
            fontWeight: 900,
            color: '#8B4513',
            margin: 0,
            letterSpacing: 4,
          }}>中医智能诊断系统</h1>
          <div style={{
            width: 40,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #D4A574, transparent)',
            margin: '8px auto',
          }} />
          <Text type="secondary" style={{ fontSize: 13, letterSpacing: 1 }}>
            Intelligent TCM Diagnosis System
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#D4A574' }} />}
              placeholder="用户名 / 工号"
              style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#D4A574' }} />}
              placeholder="密码"
              style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                letterSpacing: 4,
              }}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12, color: '#BFB8AF' }}>
            v1.0.0 · 中医智能诊断系统
          </Text>
        </div>
      </Card>
    </div>
  )
}
