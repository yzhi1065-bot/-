import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Form, Input, Switch, Select, message, Tabs, Spin } from 'antd'
import { BellOutlined, MessageOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

const defaultTemplates = [
    { id: 1, name: '复诊提醒', type: 'sms', content: '尊敬的患者{name}，您距上次就诊已30天，建议及时复诊。', status: true, last_sent: '2026-06-23' },
    { id: 2, name: '服药提醒', type: 'wechat', content: '请按时服用今日中药，祝您早日康复！', status: true, last_sent: '2026-06-23' },
    { id: 3, name: '预约确认', type: 'sms', content: '您已成功预约{doctor}医生{date} {time}，请按时就诊。', status: true, last_sent: '2026-06-22' },
    { id: 4, name: '报告生成', type: 'wechat', content: '您的诊断报告已生成，请登录查看。', status: false, last_sent: '2026-06-20' },
  ]

const defaultPushLogs = [
    { id: 1, template: '复诊提醒', target: '张三', channel: '短信', status: 'success', time: '2026-06-23 08:00' },
    { id: 2, template: '服药提醒', target: '李四', channel: '微信', status: 'success', time: '2026-06-23 07:30' },
    { id: 3, template: '预约确认', target: '王五', channel: '短信', status: 'failed', time: '2026-06-22 14:00' },
  ]

export default function MessagePushPage() {
  const [templates, setTemplates] = useState(defaultTemplates)
  const [pushLogs, setPushLogs] = useState(defaultPushLogs)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ todaySent: 28, success: 26, failed: 2, successRate: 92.8 })

  useEffect(() => {
    setLoading(true)
    request.get('/messages').then((res: any) => {
      const d = res.data || res
      if (d.templates) setTemplates(d.templates)
      if (d.logs) setPushLogs(d.logs)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <BellOutlined /> 消息推送管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="今日推送" value={stats.todaySent} suffix="条" /></Card></Col>
        <Col span={6}><Card><Statistic title="成功" value={stats.success} suffix="条" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="失败" value={stats.failed} suffix="条" valueStyle={{ color: '#C0392B' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="成功率" value={stats.successRate} suffix="%" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="templates">
        <TabPane tab="消息模板" key="templates">
          <Card>
            <Table dataSource={templates} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '模板名称', dataIndex: 'name', key: 'name' },
                { title: '渠道', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color={v === 'sms' ? 'blue' : 'green'}>{v === 'sms' ? '短信' : '微信'}</Tag> },
                { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
                { title: '启用', dataIndex: 'status', key: 'status', render: (v: boolean) => <Switch checked={v} size="small" /> },
                { title: '最后发送', dataIndex: 'last_sent', key: 'last_sent' },
                { title: '操作', key: 'action', render: () => <Space><Button size="small">编辑</Button><Button size="small">测试发送</Button></Space> },
              ]} />
          </Card>
        </TabPane>
        <TabPane tab="发送记录" key="logs">
          <Card>
            <Table dataSource={pushLogs} rowKey="id" pagination={false} size="small"
              columns={[
                { title: '模板', dataIndex: 'template', key: 'template' },
                { title: '接收人', dataIndex: 'target', key: 'target' },
                { title: '渠道', dataIndex: 'channel', key: 'channel', render: (v: string) => <Tag>{v}</Tag> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'success' ? 'green' : 'red'}>{v === 'success' ? '成功' : '失败'}</Tag> },
                { title: '时间', dataIndex: 'time', key: 'time' },
              ]} />
          </Card>
        </TabPane>
      </Tabs>
    </div>
    </Spin>
  )
}
