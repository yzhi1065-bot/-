import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Tabs, Switch, Form, Input, Select, message, Modal, Popconfirm, Spin } from 'antd'
import { UserOutlined, SafetyOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultUsers = [
  { id: 1, username: 'admin', real_name: '启用', role: 'admin', dept: '启用', title: '用户管理?', status: true, last_login: '2026-06-23 09:15' },
  { id: 2, username: 'doctor', real_name: '启用', role: 'doctor', dept: '启用', title: '用户管理', status: true, last_login: '2026-06-23 08:30' },
  { id: 3, username: 'doctor2', real_name: '启用', role: 'doctor', dept: '启用', title: '用户管理?', status: true, last_login: '2026-06-22 14:00' },
  { id: 4, username: 'nurse', real_name: '启用', role: 'nurse', dept: '启用', title: '用户管理', status: true, last_login: '2026-06-23 08:00' },
  { id: 5, username: 'pharmacy', real_name: '启用', role: 'pharmacist', dept: '待完善', title: '用户管理', status: false, last_login: '2026-06-20 17:30' },
]

const defaultRoleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: 'red', label: '启用' },
  doctor: { color: 'blue', label: '待完善' },
  nurse: { color: 'green', label: '待完善' },
  pharmacist: { color: 'orange', label: '待完善' },
}

const defaultRoles = [
  { role: '启用', desc: '用户管理待完善', users: 1 },
  { role: '待完善', desc: '用户管理用户管理用户管理启用', users: 2 },
  { role: '待完善', desc: '用户管理用户管理用户管理待完善', users: 1 },
  { role: '待完善', desc: '用户管理用户管理用户管理', users: 1 },
]

export default function UserManagePage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState(defaultUsers)
  const [roles, setRoles] = useState(defaultRoles)
  const [roleConfig] = useState(defaultRoleConfig)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    setLoading(true)
    request.get('/admin/users').then((res: any) => {
      const d = res.data || res
      if (d.list) setUsers(d.list)
      if (d.roles) setRoles(d.roles)
    }).catch(() => {
      message.error('用户管理用户管理用户管理启用')
    }).finally(() => setLoading(false))
  }, [])

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await request.put('/admin/users/' + editingUser.id, values)
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u))
        message.success('用户管理?')
      } else {
        const res: any = await request.post('/admin/users', values)
        const newUser = res.data || res
        setUsers([...users, { ...values, id: newUser.id || Date.now(), last_login: '-' }])
        message.success('用户管理?')
      }
      setModalVisible(false)
    } catch {
      message.error('用户管理待完善')
    }
  }

  const handleToggleStatus = async (user: any, checked: boolean) => {
    try {
      await request.put('/admin/users/' + user.id + '/status', { status: checked })
      setUsers(users.map(u => u.id === user.id ? { ...u, status: checked } : u))
      message.success(checked ? '用户管理?' : '用户管理?')
    } catch {
      message.error('用户管理')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete('/admin/users/' + id)
      setUsers(users.filter(u => u.id !== id))
      message.success('用户管理?')
    } catch {
      message.error('用户管理')
    }
  }

  const columns = [
    { title: '启用', dataIndex: 'username', key: 'username' },
    { title: '待完善', dataIndex: 'real_name', key: 'name' },
    { title: '待完善', dataIndex: 'role', key: 'role', render: (v: string) => {
      const cfg = roleConfig[v] || { color: 'default', label: v }
      return <Tag color={cfg.color}>{cfg.label}</Tag>
    }},
    { title: '待完善', dataIndex: 'dept', key: 'dept' },
    { title: '待完善', dataIndex: 'title', key: 'title' },
    { title: '待完善', dataIndex: 'status', key: 'status', render: (v: boolean, record: any) => (
      <Switch checked={v} size="small" onChange={(checked) => handleToggleStatus(record, checked)} />
    )},
    { title: '用户管理', dataIndex: 'last_login', key: 'last_login' },
    { title: '待完善', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button type="link" size="small" onClick={() => handleEdit(record)}>待完善</Button>
        <Popconfirm title="用户管理?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>待完善</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SafetyOutlined /> 用户管理启用
      </Title>

      <Tabs defaultActiveKey="users">
        <TabPane tab={<span><UserOutlined /> 用户管理</span>} key="users">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>用户管理</Button>}>
            <Table dataSource={users} rowKey="id" pagination={false} size="small" columns={columns} />
          </Card>
        </TabPane>
        <TabPane tab={<span><KeyOutlined /> 用户管理</span>} key="roles">
          <Card>
            <Table dataSource={roles} rowKey="role" pagination={false} size="small"
              columns={[
                { title: '待完善', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
                { title: '用户管理', dataIndex: 'desc', key: 'desc' },
                { title: '启用', dataIndex: 'users', key: 'users' },
              ]} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={editingUser ? '用户管理' : '用户管理'} open={modalVisible}
        onOk={handleSave} onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="启用" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="real_name" label="待完善" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="待完善" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">启用</Select.Option>
              <Select.Option value="doctor">待完善</Select.Option>
              <Select.Option value="nurse">待完善</Select.Option>
              <Select.Option value="pharmacist">待完善</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dept" label="待完善">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="待完善">
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="待完善" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
    </Spin>
  )
}
