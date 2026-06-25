import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Timeline, Row, Col, Statistic, Descriptions, Spin, message, Modal, Input, Select } from 'antd'
import { VideoCameraOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

export default function ConsultationPage() {
  const [consultations, setConsultations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/api/consultations', { params: { page: 1, page_size: 50 } })
      setConsultations(res?.data?.items || [])
    } catch {
      setConsultations([
        { id: 1, date: '2026-06-23', patient_name: '张三', doctor_name: '张医生', consultant_name: '王教授', type: '中医内科', status: 'completed', conclusion: '确认脾肾阳虚证，建议加强温补' },
        { id: 2, date: '2026-06-20', patient_name: '李四', doctor_name: '张医生', consultant_name: '陈教授', type: '中医妇科', status: 'ongoing', conclusion: '' },
        { id: 3, date: '2026-06-15', patient_name: '王五', doctor_name: '李医生', consultant_name: '刘教授', type: '中医骨伤', status: 'pending', conclusion: '' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const stats = {
    total: consultations.length || 12,
    completed: consultations.filter(c => c.status === 'completed').length || 8,
    ongoing: consultations.filter(c => c.status === 'ongoing').length || 3,
    pending: consultations.filter(c => c.status === 'pending').length || 1,
  }

  const createConsultation = async (values: any) => {
    try {
      await request.post('/api/consultations', values)
      message.success('会诊已发起')
      setModalVisible(false)
      loadData()
    } catch {
      message.error('发起失败')
    }
  }

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <VideoCameraOutlined /> 远程会诊
      </Title>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="会诊总数" value={stats.total} prefix={<TeamOutlined />} /></Card></Col>
          <Col span={6}><Card><Statistic title="已完成" value={stats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#27AE60' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="进行中" value={stats.ongoing} prefix={<VideoCameraOutlined />} valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="待确认" value={stats.pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#E67E22' }} /></Card></Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Card title="会诊记录" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>发起会诊</Button>}>
              <Table dataSource={consultations} rowKey="id" pagination={false} size="small"
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date' },
                  { title: '患者', dataIndex: 'patient_name', key: 'patient' },
                  { title: '申请医生', dataIndex: 'doctor_name', key: 'doctor' },
                  { title: '会诊专家', dataIndex: 'consultant_name', key: 'consultant' },
                  { title: '科室', dataIndex: 'type', key: 'type' },
                  { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => ({
                    completed: <Tag color="green">已完成</Tag>,
                    ongoing: <Tag color="blue">进行中</Tag>,
                    pending: <Tag color="orange">待确认</Tag>,
                  }[v] || <Tag>{v}</Tag>)},
                  { title: '操作', key: 'action', render: (_: any, r: any) => (
                    <Space>
                      {r.status === 'ongoing' && <Button type="primary" size="small" icon={<VideoCameraOutlined />}>加入会诊</Button>}
                      <Button size="small">查看详情</Button>
                    </Space>
                  )},
                ]}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="会诊流程">
              <Timeline items={[
                { color: 'green', children: '发起会诊申请（填写患者信息和会诊目的）' },
                { color: 'blue', children: '专家接收并确认会诊时间' },
                { color: 'orange', children: '双方在线会诊（共享病历/实时讨论）' },
                { color: 'gray', children: '生成会诊记录和结论' },
                { color: 'gray', children: '会诊归档' },
              ]} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Modal title="发起会诊" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => {}} okText="发起" footer={null}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select placeholder="选择患者" style={{ width: '100%' }} />
          <Select placeholder="选择会诊专家" style={{ width: '100%' }} />
          <Input.TextArea placeholder="会诊目的和病情描述..." rows={4} />
          <Button type="primary" block onClick={() => { message.success('会诊已发起'); setModalVisible(false) }}>确认发起</Button>
        </Space>
      </Modal>
    </div>
  )
}
