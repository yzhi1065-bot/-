import React, { useState } from 'react'
import { Card, Row, Col, Tag, Typography, Space, List, Button, Tabs, Timeline, Divider, Alert, message, Input, Badge } from 'antd'
import {
  CalendarOutlined, BellOutlined, MedicineBoxOutlined, MessageOutlined,
  RightOutlined, EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined,
  UserOutlined, FileTextOutlined, HeartOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { TabPane } = Tabs

export default function PatientMiniAppPage() {
  const navigate = useNavigate()

  const todayAppointment = {
    time: '09:30', doctor: '张医生', dept: '中医内科', address: '门诊201室', status: 'waiting'
  }

  const medRecords = [
    { date: '2026-06-23', doctor: '张医生', diagnosis: '脾肾阳虚证', status: 'completed' },
    { date: '2026-05-20', doctor: '张医生', diagnosis: '肝郁脾虚证', status: 'completed' },
    { date: '2026-04-15', doctor: '张医生', diagnosis: '初诊', status: 'completed' },
  ]

  const notifications = [
    { title: '复诊提醒', content: '您已30天未复诊，建议预约', time: '今天 08:00', type: 'reminder' },
    { title: '服药提醒', content: '今日中药请按时服用', time: '今天 07:30', type: 'medication' },
    { title: '报告生成', content: '您的诊断报告已生成', time: '昨天 15:20', type: 'report' },
  ]

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F5F0EB', minHeight: '100vh', padding: 16 }}>
      {/* 用户信息头部 */}
      <Card style={{ marginBottom: 16, borderRadius: 16, background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 100%)', border: 'none' }}>
        <Row align="middle">
          <Col>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}>
              <UserOutlined />
            </div>
          </Col>
          <Col flex="auto" style={{ paddingLeft: 12 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>张三</Text>
            <div><Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 8 }}>阳虚质 · 男 45岁</Tag></div>
          </Col>
          <Col>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 20, color: '#fff' }} />
            </Badge>
          </Col>
        </Row>
      </Card>

      {/* 今日就诊卡片 */}
      <Card style={{ marginBottom: 16, borderRadius: 16 }} bodyStyle={{ padding: 16 }}>
        <Row align="middle">
          <Col flex="auto">
            <Text type="secondary" style={{ fontSize: 12 }}>今日就诊</Text>
            <div style={{ fontSize: 18, fontWeight: 600, margin: '4px 0' }}>{todayAppointment.time}</div>
            <Space>
              <Tag color="blue">{todayAppointment.doctor}</Tag>
              <Text style={{ fontSize: 13, color: '#666' }}>{todayAppointment.dept}</Text>
            </Space>
            <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>{todayAppointment.address}</div>
          </Col>
          <Col>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#8B4513' }}>09:30</div>
              <Button type="primary" size="small" style={{ borderRadius: 12, marginTop: 4 }}>取号</Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 快捷功能区 */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        {[
          { icon: <CalendarOutlined />, label: '预约挂号', color: '#8B4513', link: '#' },
          { icon: <FileTextOutlined />, label: '我的报告', color: '#C0392B', link: '/patient/records' },
          { icon: <MedicineBoxOutlined />, label: '我的处方', color: '#27AE60', link: '/medication' },
          { icon: <MessageOutlined />, label: '在线咨询', color: '#5B8DEF', link: '#' },
        ].map((item, idx) => (
          <Col span={6} key={idx} style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={() => item.link !== '#' && navigate(item.link)}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 22, color: item.color }}>
              {item.icon}
            </div>
            <Text style={{ fontSize: 11, color: '#666' }}>{item.label}</Text>
          </Col>
        ))}
      </Row>

      {/* 通知列表 */}
      <Card title="消息通知" size="small" style={{ marginBottom: 16, borderRadius: 16 }}
        extra={<Text type="secondary" style={{ fontSize: 12 }}>查看全部</Text>}>
        {notifications.map((item, idx) => (
          <List.Item key={idx} style={{ padding: '8px 0' }}>
            <List.Item.Meta
              avatar={<Tag color={item.type === 'reminder' ? 'orange' : item.type === 'medication' ? 'blue' : 'green'} style={{ borderRadius: 8 }}>{item.type === 'reminder' ? '提醒' : item.type === 'medication' ? '用药' : '报告'}</Tag>}
              title={<Text style={{ fontSize: 14 }}>{item.title}</Text>}
              description={<div><Text style={{ fontSize: 12, color: '#999' }}>{item.content}</Text><div><Text style={{ fontSize: 11, color: '#ccc' }}>{item.time}</Text></div></div>}
            />
          </List.Item>
        ))}
      </Card>

      {/* 就诊记录 */}
      <Card title="最近就诊" size="small" style={{ marginBottom: 16, borderRadius: 16 }}
        extra={<Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/patient/records')}>全部 <RightOutlined /></Text>}>
        <Timeline items={medRecords.map(r => ({
          color: 'green',
          children: <div><Text style={{ fontSize: 13 }}>{r.date}</Text><div><Tag color="red" style={{ fontSize: 11 }}>{r.diagnosis}</Tag><Text style={{ fontSize: 12, color: '#999' }}>{r.doctor}</Text></div></div>,
        }))} />
      </Card>

      {/* 快捷入口 */}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button block style={{ textAlign: 'left', height: 44, borderRadius: 12 }}
          onClick={() => navigate('/patient/health')}>
          <HeartOutlined style={{ color: '#C0392B' }} /> 健康档案 <RightOutlined style={{ float: 'right', marginTop: 6 }} />
        </Button>
        <Button block style={{ textAlign: 'left', height: 44, borderRadius: 12 }}
          onClick={() => navigate('/patient/herbs')}>
          <MedicineBoxOutlined style={{ color: '#8B4513' }} /> 中药查询 <RightOutlined style={{ float: 'right', marginTop: 6 }} />
        </Button>
        <Button block style={{ textAlign: 'left', height: 44, borderRadius: 12 }}
          onClick={() => navigate('/solar-term')}>
          <EnvironmentOutlined style={{ color: '#27AE60' }} /> 节气养生 <RightOutlined style={{ float: 'right', marginTop: 6 }} />
        </Button>
      </Space>

      {/* 底部Tab导航 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
        background: '#fff', borderTop: '1px solid #f0f0f0', padding: '8px 0',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {[
          { icon: <CalendarOutlined />, label: '首页', active: true },
          { icon: <FileTextOutlined />, label: '记录', active: false },
          { icon: <MedicineBoxOutlined />, label: '健康', active: false },
          { icon: <UserOutlined />, label: '我的', active: false },
        ].map((item, idx) => (
          <div key={idx} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 20, color: item.active ? '#8B4513' : '#ccc' }}>{item.icon}</div>
            <div style={{ fontSize: 11, color: item.active ? '#8B4513' : '#999' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
