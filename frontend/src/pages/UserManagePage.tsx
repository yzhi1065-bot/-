import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Typography, Space, Button, Tabs, Switch, Form, Input, Select, message, Modal, Popconfirm, Spin } from 'antd'
import { UserOutlined, SafetyOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography
const { TabPane } = Tabs

const defaultUsers = [
  { id: 1, username: 'admin', real_name: '系统管理员', role: 'admin', dept: '管理部', title: '超级管理员', status: true, last_login: '2026-06-23 09:15' },
  { id: 2, username: 'doctor', real_name: '张医生', role: 'doctor', dept: '中医内科', title: '主治医师', status: true, last_login: '2026-06-23 08:30' },
  { id: 3, username: 'doctor2', real_name: '李医生', role: 'doctor', dept: '中医内科', title: '副主任医师', status: true, last_login: '2026-06-22 14:00' },
  { id: 4, username: 'nurse', real_name: '王护士', role: 'nurse', dept: '护理部', title: '主管护师', status: true, last_login: '2026-06-23 08:00' },
  { id: 5, username: 'pharmacy', real_name: '赵药师', role: 'pharmacist', dept: '药房', title: '主管药师', status: false, last_login: '2026-06-20 17:30' },
]

const defaultRoleConfig: Record<string, { color: string; label: string }> = {
  admin: { color: 'red', label: '管理员' },
  doctor: { color: 'blue', label: '医生' },
  nurse: { color: 'green', label: '护士' },
  pharmacist: { color: 'orange', label: '药师' },
}

const defaultRoles = [
  { role: 'admin', desc: '系统管理员，拥有所有权限', users: 1 },
  { role: 'doctor', desc: '医生角色，可查看患者、病历，开处方', users: 2 },
  { role: 'nurse', desc: '护士角色，可查看护理记录、执行护理操作', users: 1 },
  { role: 'pharmacist', desc: '药师角色，可管理药品库存、审核处方', users: 1 },
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
    request.get('/api/admin/users').then((res: any) => {
      const d = res.data || res
      if (d.list) setUsers(d.list)
      if (d.roles) setRoles(d.roles)
    }).catch(() => {
      // 使用默认mock数据
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
        await request.put('/api/admin/users/' + editingUser.id, values)
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u))
        message.success('用户更新成功')
      } else {
        const res: any = await request.post('/api/admin/users', values)
        const newUser = res.data || res
        setUsers([...users, { ...values, id: newUser.id || Date.now(), last_login: '-' }])
        message.success('用户创建成功')
      }
      setModalVisible(false)
    } catch {
      message.error('操作失败，请重试')
    }
  }

  const handleToggleStatus = async (user: any, checked: boolean) => {
    try {
      await request.put('/api/admin/users/' + user.id + '/status', { status: checked })
      setUsers(users.map(u => u.id === user.id ? { ...u, status: checked } : u))
      message.success(checked ? '用户已启用' : '用户已禁用')
    } catch {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await request.delete('/api/admin/users/' + id)
      setUsers(users.filter(u => u.id !== id))
      message.success('用户已删除')
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'real_name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => {
      const cfg = roleConfig[v] || { color: 'default', label: v }
      return <Tag color={cfg.color}>{cfg.label}</Tag>
    }},
    { title: '科室', dataIndex: 'dept', key: 'dept' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: boolean, record: any) => (
      <Switch checked={v} size="small" onChange={(checked) => handleToggleStatus(record, checked)} />
    )},
    { title: '最后登录', dataIndex: 'last_login', key: 'last_login' },
    { title: '操作', key: 'action', render: (_: any, record: any) => (
      <Space>
        <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
        <Popconfirm title="确认删除该用户?" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ]

  return (
    <Spin spinning={loading}>
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        <SafetyOutlined /> 用户管理
      </Title>

      <Tabs defaultActiveKey="users">
        <TabPane tab={<span><UserOutlined /> 用户列表</span>} key="users">
          <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>}>
            <Table dataSource={users} rowKey="id" pagination={false} size="small" columns={columns} />
          </Card>
        </TabPane>
        <TabPane tab={<span><KeyOutlined /> 角色管理</span>} key="roles">
          <Card>
            <Table dataSource={roles} rowKey="role" pagination={false} size="small"
              columns={[
                { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
                { title: '描述', dataIndex: 'desc', key: 'desc' },
                { title: '用户数', dataIndex: 'users', key: 'users' },
              ]} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={editingUser ? '编辑用户' : '新增用户'} open={modalVisible}
        onOk={handleSave} onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="real_name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="doctor">医生</Select.Option>
              <Select.Option value="nurse">护士</Select.Option>
              <Select.Option value="pharmacist">药师</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dept" label="科室">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="职称">
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
    </Spin>
  )
}
