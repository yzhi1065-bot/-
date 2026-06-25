import React from 'react'
import { Card, Row, Col, Typography, List, Tag, Space, Timeline } from 'antd'
import {
  FileTextOutlined, MedicineBoxOutlined, UserOutlined, CalendarOutlined,
  CheckCircleOutlined, RightOutlined, HomeOutlined, HeartOutlined, ReadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function PatientHomePage() {
  const navigate = useNavigate()

  const quickActions = [
    { icon: <FileTextOutlined />, label: '预问诊', link: '/patient-consult', color: '#8B4513' },
    { icon: <MedicineBoxOutlined />, label: '查中药', link: '/patient/herbs', color: '#D4A574' },
    { icon: <ReadOutlined />, label: '看报告', link: '/report/1', color: '#C0392B' },
    { icon: <CalendarOutlined />, label: '约复诊', link: '#', color: '#27AE60' },
  ]

  const timelineItems = [
    { color: 'green', children: '06-23 就诊：脾肾阳虚证，已开具处方' },
    { color: 'blue', children: '05-20 就诊：肝郁脾虚证，逍遥散加减' },
    { color: 'gray', children: '04-15 初诊：完成体质辨识 - 阳虚质' },
  ]

  return (
    <div>
      {/* 患者信息头部 */}
      <Card style={{
        marginBottom: 16,
        background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)',
        borderRadius: 16,
        border: 'none',
      }}>
        <Row align="middle" gutter={16}>
          <Col>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff',
            }}>
              <UserOutlined />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ color: '#fff', margin: 0, fontFamily: '"Noto Serif SC", serif' }}>张三</Title>
            <Space style={{ marginTop: 4 }}>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 12 }}>男 · 45岁</Tag>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 12 }}>阳虚质</Tag>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 12 }}>3次就诊</Tag>
            </Space>
          </Col>
          <Col>
            <Text style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 13 }}
              onClick={() => navigate('/patient/health')}>
              档案 <RightOutlined style={{ fontSize: 12 }} />
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 快捷入口 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={8} justify="space-around">
          {quickActions.map((item, idx) => (
            <Col key={idx} span={6} style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => navigate(item.link)}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${item.color}12`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 6px', fontSize: 22, color: item.color,
              }}>
                {item.icon}
              </div>
              <Text style={{ fontSize: 12, color: '#666' }}>{item.label}</Text>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 待办提醒 */}
      <Card title="待办事项" size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <List size="small" dataSource={[
          { title: '复诊提醒', desc: '距上次就诊已30天，建议复诊', tag: '提醒', color: 'orange' },
          { title: '服药提醒', desc: '今日中药待服用', tag: '待办', color: 'blue' },
        ]} renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Tag color={item.color} style={{ borderRadius: 8 }}>{item.tag}</Tag>}
              title={<Text style={{ fontSize: 14 }}>{item.title}</Text>}
              description={<Text style={{ fontSize: 13, color: '#999' }}>{item.desc}</Text>}
            />
          </List.Item>
        )} />
      </Card>

      {/* 就诊时间线 */}
      <Card title="就诊记录" size="small" style={{ borderRadius: 12 }}>
        <Timeline items={timelineItems} />
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 13, cursor: 'pointer' }}
            onClick={() => navigate('/patient/records')}>
            查看全部 <RightOutlined />
          </Text>
        </div>
      </Card>

      {/* 底部提示 */}
      <div style={{
        textAlign: 'center', padding: '16px 0', color: '#BFB8AF', fontSize: 12,
      }}>
        中医智能诊断系统 · 患者端 v1.0
      </div>
    </div>
  )
}
