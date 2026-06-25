import React, { useState, useEffect } from 'react'
import { Card, List, Tag, Typography, Space, Badge, Tabs, Button, Empty, message, Switch, Divider, Spin } from 'antd'
import { BellOutlined, MedicineBoxOutlined, CalendarOutlined, WarningOutlined, CheckCircleOutlined, ClearOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultNotifications = [
  { id: 1, type: 'followup', title: '????', content: '??????????72????????', time: '10???', read: false, priority: 'medium' },
  { id: 2, type: 'medication', title: '????', content: '???????2??????', time: '30???', read: false, priority: 'medium' },
  { id: 3, type: 'review', title: '???', content: '?????AI?????????', time: '1???', read: false, priority: 'high' },
  { id: 4, type: 'system', title: '????', content: '??????? - 2026-06-23 02:00', time: '8???', read: true, priority: 'low' },
  { id: 5, type: 'warning', title: '????', content: '???????????????', time: '??', read: true, priority: 'high' },
  { id: 6, type: 'system', title: '????', content: 'AI??????v1.2.0', time: '??', read: true, priority: 'low' },
]

export default function NotificationPage() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState(defaultNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    setLoading(true)
    request.get('/notifications').then((res: any) => {
      const d = res.data || res
      if (d.list) setNotifications(d.list)
    }).catch(() => {
      message.error('?????????????')
    }).finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await request.put('/notifications/' + id + '/read')
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
      message.success('??????')
    } catch {
      message.error('????')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await request.put('/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      message.success('???????')
    } catch {
      message.error('????')
    }
  }

  const priorityConfig: Record<string, { color: string; label: string }> = {
    high: { color: 'red', label: '??' },
    medium: { color: 'orange', label: '??' },
    low: { color: 'blue', label: '??' },
  }

  const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    followup: { icon: <CalendarOutlined />, color: '#27AE60' },
    medication: { icon: <MedicineBoxOutlined />, color: '#8B4513' },
    review: { icon: <BellOutlined />, color: '#C0392B' },
    system: { icon: <BellOutlined />, color: '#5B8DEF' },
    warning: { icon: <WarningOutlined />, color: '#E67E22' },
  }

  const renderList = (filter?: string) => {
    const filtered = filter ? notifications.filter(n => n.type === filter) : notifications
    return (
      <List
        dataSource={filtered}
        locale={{ emptyText: <Empty description="????" /> }}
        renderItem={(item) => {
          const tc = typeConfig[item.type] || { icon: <BellOutlined />, color: '#999' }
          const pc = priorityConfig[item.priority] || { color: 'default', label: '' }
          return (
            <List.Item
              style={{
                background: item.read ? 'transparent' : 'rgba(139,69,19,0.03)',
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 4,
              }}
              actions={[
                !item.read && <Button type="link" size="small" onClick={() => handleMarkRead(item.id)}>?????</Button>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: tc.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: tc.color,
                  }}>
                    {tc.icon}
                  </div>
                }
                title={
                  <Space>
                    {!item.read && <Badge dot><span>{item.title}</span></Badge>}
                    {item.read && item.title}
                    <Tag color={pc.color} style={{ fontSize: 11, lineHeight: '18px' }}>{pc.label}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text style={{ fontSize: 13, color: '#666' }}>{item.content}</Text>
                    <div><Text style={{ fontSize: 12, color: '#999' }}>{item.time}</Text></div>
                  </div>
                }
              />
            </List.Item>
          )
        }}
      />
    )
  }

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <BellOutlined /> ????
      </Title>

      <Card title={<Space>
        <BellOutlined />
        <span>????</span>
        {unreadCount > 0 && <Tag color="red">{unreadCount} ???</Tag>}
      </Space>}
        extra={<Button size="small" icon={<ClearOutlined />} onClick={handleMarkAllRead}>???????</Button>}
      >
        <Tabs defaultActiveKey="all">
          <TabPane tab="??" key="all">{renderList()}</TabPane>
          <TabPane tab={<span><CalendarOutlined /> ??</span>} key="followup">{renderList('followup')}</TabPane>
          <TabPane tab={<span><MedicineBoxOutlined /> ??</span>} key="medication">{renderList('medication')}</TabPane>
          <TabPane tab={<span><WarningOutlined /> ??</span>} key="warning">{renderList('warning')}</TabPane>
          <TabPane tab={<span><BellOutlined /> ??</span>} key="system">{renderList('system')}</TabPane>
        </Tabs>
      </Card>
    </div>
    </Spin>
  )
}
