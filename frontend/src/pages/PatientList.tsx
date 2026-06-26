import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Input, Space, Tag, Modal, Form, message, Select, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../services/http'
import { API_ENDPOINTS } from '../services/api'
import dayjs from 'dayjs'

export default function PatientList() {
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const res: any = await request.get(API_ENDPOINTS.PATIENTS, {
        params: { page, page_size: 20, keyword },
      })
      setData(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (e) {
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleCreate = async (values: any) => {
    try {
      const payload: any = { name: values.name }
      if (values.gender) payload.gender = values.gender
      if (values.phone) payload.phone = values.phone
      if (values.chief_complaint) payload.chief_complaint = values.chief_complaint
      const res: any = await request.post(API_ENDPOINTS.PATIENTS, payload)
      message.success('患者建档成功')
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e) {
      message.error('操作失败，请重试')
    }
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 60,
      render: (v: string) => v === 'male' ? '男' : v === 'female' ? '女' : '-' },
    { title: '年龄', dataIndex: 'age', key: 'age', width: 60 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '主诉', dataIndex: 'chief_complaint', key: 'chief_complaint', ellipsis: true },
    { title: '建档时间', dataIndex: 'created_at', key: 'created_at', width: 120,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/patients/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => navigate('/diagnosis', { state: { patientId: record.id } })}>
            开始诊疗
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title="患者管理" extra={
        <Space>
          <Input.Search
            placeholder="搜索患者姓名/手机号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            新建患者
          </Button>
        </Space>
      }>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 位患者`,
          }}
        />
      </Card>

      <Modal
        title="新建患者"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="gender" label="性别">
              <Select style={{ width: 120 }}>
                <Select.Option value="male">男</Select.Option>
                <Select.Option value="female">女</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="chief_complaint" label="主诉" style={{ flex: 1 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Space>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="chief_complaint" label="主诉">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
