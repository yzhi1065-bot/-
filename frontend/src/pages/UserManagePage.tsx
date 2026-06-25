import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Tabs, Switch, Form, Input, Select, message, Modal, Popconfirm, Spin } from 'antd'
import { UserOutlined, SafetyOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultUsers = [
  { id: 1, username: 'admin', real_name: '???', role: 'admin', dept: '???', title: '?????', status: true, last_login: '2026-06-23 09:15' },
  { id: 2, username: 'doctor', real_name: '???', role: 'doctor', dept: '???', title: '????', status: true, last_login: '2026-06-23 08:30' },
  { id: 3, username: 'doctor2', real_name: '???', role: 'doctor', dept: '???', title: '?????', status: true, last_login: '2026-06-22 14:00' },
  { id: 4, username: 'nurse', real_name: '???', role: 'nurse', dept: '???', title: '????', status: true, last_login: '2026-06-23 08:00' },
  { id: 5, username: 'pharmacy', real_name: '???', role: 'pharmacist', dept: '??', title: '????', status: false, last_login: '2026-06-20 17:30' },
]

const defaultRoleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: 'red', label: '???' },
  doctor: { color: 'blue', label: '??' },
  nurse: { color: 'green', label: '??' },
  pharmacist: { color: 'orange', label: '??' },
}

const defaultRoles = [
  { role: '???', desc: '??????', users: 1 },
  { role: '??', desc: '???????????????', users: 2 },
  { role: '??', desc: '??????????????', users: 1 },
  { role: '??', desc: '????????????', users: 1 },
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
      message.error('???????????????')
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
        message.success('?????')
      } else {
        const res: any = await request.post('/admin/users', values)
        const newUser = res.data || res
        setUsers([...users, { ...values, id: newUser.id || Date.now(), last_login: '-' }])
        message.success('?????')
      }
      setModalVisible(false)
    } catch {
      message.error('??????')
    }
  }

  const handleToggleStatus = async (user: any, checked: boolean) => {
    try {
      await request.put('/admin/users/' + user.id + '/status', { status: checked })
      setUsers(users.map(u => u.id === user.id ? { ...u, status: checked } : u))
      message.success(checked ? '?????' : '?????')
    } catch {
      message.error('????')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete('/admin/users/' + id)
      setUsers(users.filter(u => u.id !== id))
      message.success('?????')
    } catch {
      message.error('????')
    }
  }

  const columns = [
    { title: '???', dataIndex: 'username', key: 'username' },
    { title: '??', dataIndex: 'real_name', key: 'name' },
    { title: '??', dataIndex: 'role', key: 'role', render: (v: string) => {
      const cfg = roleConfig[v] || { color: 'default', label: v }
      return <Tag color={cfg.color}>{cfg.label}</Tag>
    }},
    { title: '??', dataIndex: 'dept', key: 'dept' },
    { title: '??', dataIndex: 'title', key: 'title' },
    { title: '??', dataIndex: 'status', key: 'status', render: (v: boolean, record: any) => (
      <Switch checked={v} size="small" onChange={(checked) => handleToggleStatus(record, checked)} />
    )},
    { title: '????', dataIndex: 'last_login', key: 'last_login' },
    { title: '??', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button type="link" size="small" onClick={() => handleEdit(record)}>??</Button>
        <Popconfirm title="?????" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>??</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SafetyOutlined /> ???????
      </Title>

      <Tabs defaultActiveKey="users">
        <TabPane tab={<span><UserOutlined /> ????</span>} key="users">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>????</Button>}>
            <Table dataSource={users} rowKey="id" pagination={false} size="small" columns={columns} />
          </Card>
        </TabPane>
        <TabPane tab={<span><KeyOutlined /> ????</span>} key="roles">
          <Card>
            <Table dataSource={roles} rowKey="role" pagination={false} size="small"
              columns={[
                { title: '??', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
                { title: '????', dataIndex: 'desc', key: 'desc' },
                { title: '???', dataIndex: 'users', key: 'users' },
              ]} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={editingUser ? '????' : '????'} open={modalVisible}
        onOk={handleSave} onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="???" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="real_name" label="??" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="??" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">???</Select.Option>
              <Select.Option value="doctor">??</Select.Option>
              <Select.Option value="nurse">??</Select.Option>
              <Select.Option value="pharmacist">??</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dept" label="??">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="??">
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="??" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
    </Spin>
  )
}
