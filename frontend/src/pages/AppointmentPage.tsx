import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic, Modal, Form, Select, DatePicker, Input, message, Calendar, Badge, Spin } from 'antd'
import { CalendarOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function AppointmentPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await request.get('/api/appointments', { params: { page: 1, page_size: 50 } })
      setAppointments(res?.data?.items || [])
    } catch {
      setAppointments([
        { id: 1, date: '2026-06-23', time: '09:00', patient_name: '张三', doctor_name: '张医生', dept: '中医内科', visit_type: '复诊', status: 'completed' },
        { id: 2, date: '2026-06-23', time: '09:30', patient_name: '李四', doctor_name: '张医生', dept: '中医内科', visit_type: '初诊', status: 'ongoing' },
        { id: 3, date: '2026-06-24', time: '10:00', patient_name: '王五', doctor_name: '李医生', dept: '针灸科', visit_type: '复诊', status: 'pending' },
        { id: 4, date: '2026-06-24', time: '14:00', patient_name: '赵六', doctor_name: '张医生', dept: '中医内科', visit_type: '初诊', status: 'pending' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const handleCreate = async (values: any) => {
    try {
      await request.post('/api/appointments', {
        patient_name: values.patient,
        doctor_name: values.doctor,
        appointment_date: values.date?.format('YYYY-MM-DD'),
        time_slot: values.time,
      })
      message.success('预约成功')
      setModalVisible(false)
      form.resetFields()
      loadAppointments()
    } catch {
      message.error('创建预约失败')
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await request.post(`/api/appointments/${id}/cancel`)
      message.success('已取消预约')
      loadAppointments()
    } catch {
      message.error('取消失败')
    }
  }

  const todayCount = appointments.filter(a => a.date === dayjs().format('YYYY-MM-DD')).length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <CalendarOutlined /> 预约挂号管理
      </Title>

      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="今日预约" value={todayCount} suffix="人" /></Card></Col>
          <Col span={6}><Card><Statistic title="已完成" value={completedCount} suffix="人" valueStyle={{ color: '#27AE60' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="待就诊" value={pendingCount} suffix="人" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="取消" value={cancelledCount} suffix="人" valueStyle={{ color: '#C0392B' }} /></Card></Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Card title="号源日历" size="small">
              <Calendar fullscreen={false} cellRender={(date) => {
                const d = date.format('YYYY-MM-DD')
                const count = appointments.filter(a => a.date === d).length
                return count > 0 ? <Badge count={count} size="small" /> : null
              }} />
            </Card>
          </Col>
          <Col span={16}>
            <Card title="预约列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建预约</Button>}>
              <Table dataSource={appointments} rowKey="id" pagination={false} size="small"
                columns={[
                  { title: '日期', dataIndex: 'date', key: 'date' },
                  { title: '时间', dataIndex: 'time', key: 'time' },
                  { title: '患者', dataIndex: 'patient_name', key: 'patient' },
                  { title: '医生', dataIndex: 'doctor_name', key: 'doctor' },
                  { title: '科室', dataIndex: 'dept', key: 'dept' },
                  { title: '类型', dataIndex: 'visit_type', key: 'type', render: (v: string) => <Tag color={v === '初诊' ? 'blue' : 'green'}>{v}</Tag> },
                  { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => {
                    const m: Record<string, any> = { completed: { color: 'green', label: '已完成' }, ongoing: { color: 'blue', label: '就诊中' }, pending: { color: 'orange', label: '待就诊' }, cancelled: { color: 'red', label: '已取消' } }
                    return <Tag color={m[v]?.color}>{m[v]?.label || v}</Tag>
                  }},
                  { title: '操作', key: 'action', render: (_: any, r: any) => (
                    <Space>
                      <Button size="small">详情</Button>
                      {r.status === 'pending' && <Button size="small" danger onClick={() => handleCancel(r.id)}>取消</Button>}
                    </Space>
                  )},
                ]} />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Modal title="新建预约" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} okText="创建">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="patient" label="患者" rules={[{ required: true }]}><Input placeholder="搜索或输入患者姓名" /></Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="date" label="日期" rules={[{ required: true }]}><DatePicker /></Form.Item>
            <Form.Item name="time" label="时间段" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Select.Option value="09:00">09:00</Select.Option>
                <Select.Option value="09:30">09:30</Select.Option>
                <Select.Option value="10:00">10:00</Select.Option>
                <Select.Option value="10:30">10:30</Select.Option>
                <Select.Option value="14:00">14:00</Select.Option>
                <Select.Option value="14:30">14:30</Select.Option>
                <Select.Option value="15:00">15:00</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="doctor" label="医生" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="张医生">张医生</Select.Option>
              <Select.Option value="李医生">李医生</Select.Option>
              <Select.Option value="王医生">王医生</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
