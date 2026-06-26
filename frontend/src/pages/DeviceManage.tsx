import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Badge, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, ReloadOutlined, LaptopOutlined } from '@ant-design/icons'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'

const { Title, Text } = Typography

export default function DeviceManage() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [registerModal, setRegisterModal] = useState(false)
  const [form] = Form.useForm()

  const loadDevices = async () => {
    setLoading(true)
    try {
      const res: any = await request.get(API_ENDPOINTS.DEVICES)
      setDevices(res.data || [])
    } catch (e) {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  const handleRegister = async (values: any) => {
    try {
      await request.post(API_ENDPOINTS.DEVICE_REGISTER, values)
      message.success('设备注册成功')
      setRegisterModal(false)
      form.resetFields()
      loadDevices()
    } catch (e) {
      message.error('操作失败，请重试')
    }
  }

  const deviceTypeLabel: Record<string, string> = {
    pulse: '脉诊仪',
    tongue: '舌诊仪',
    face: '面诊仪',
    voice: '声诊仪',
  }

  const deviceTypeColor: Record<string, string> = {
    pulse: 'blue',
    tongue: 'red',
    face: 'purple',
    voice: 'cyan',
  }

  const columns = [
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型', dataIndex: 'device_type', key: 'device_type',
      render: (v: string) => <Tag color={deviceTypeColor[v]}>{deviceTypeLabel[v] || v}</Tag>,
    },
    { title: '厂商', dataIndex: 'manufacturer', key: 'manufacturer', render: (v: string) => v || '-' },
    { title: '型号', dataIndex: 'model', key: 'model', render: (v: string) => v || '-' },
    { title: '序列号', dataIndex: 'serial_no', key: 'serial_no' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => (
        <Badge status={v === 'online' ? 'success' : v === 'error' ? 'error' : 'default'}
          text={v === 'online' ? '在线' : v === 'offline' ? '离线' : '异常'} />
      ),
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={async () => {
            await request.put(API_ENDPOINTS.DEVICE_STATUS(record.id), { status: 'online' })
            message.success('已连接')
            loadDevices()
          }}>连接</Button>
          <Button size="small" onClick={async () => {
            await request.put(API_ENDPOINTS.DEVICE_STATUS(record.id), { status: 'offline' })
            message.success('已断开')
            loadDevices()
          }}>断开</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <LaptopOutlined /> 设备管理
      </Title>

      <Card
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadDevices}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterModal(true)}>
              注册设备
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={devices}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal title="注册设备" open={registerModal} onCancel={() => setRegisterModal(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="name" label="设备名称" rules={[{ required: true }]}>
            <Input placeholder="例如：门诊1号脉诊仪" />
          </Form.Item>
          <Form.Item name="device_type" label="设备类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="pulse">脉诊仪</Select.Option>
              <Select.Option value="tongue">舌诊仪</Select.Option>
              <Select.Option value="face">面诊仪</Select.Option>
              <Select.Option value="voice">声诊仪</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="manufacturer" label="厂商">
            <Input />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input />
          </Form.Item>
          <Form.Item name="serial_no" label="序列号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="connection_type" label="连接方式">
            <Select defaultValue="usb">
              <Select.Option value="usb">USB</Select.Option>
              <Select.Option value="bluetooth">蓝牙</Select.Option>
              <Select.Option value="wifi">WiFi</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
