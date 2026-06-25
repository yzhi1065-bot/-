import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Input, Space, Modal, Form, InputNumber, DatePicker, message, Typography, Select } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function PurchaseManagePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [drugs, setDrugs] = useState<any[]>([])
  const [form] = Form.useForm()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 20 }
      if (keyword) params.keyword = keyword
      const res: any = await request.get('/api/pharmacy/purchases', { params })
      setData(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (e) { /* ignore */ }
    setLoading(false)
  }, [page, keyword])

  useEffect(() => { loadData() }, [loadData])

  // 加载药品列表用于选择
  useEffect(() => {
    request.get('/api/pharmacy/drugs', { params: { page: 1, page_size: 100 } }).then((res: any) => {
      setDrugs(res.data?.items || [])
    }).catch(() => {})
  }, [])

  const handleSave = async (values: any) => {
    const drug = drugs.find(d => d.id === values.drug_id)
    const purchasePrice = values.purchase_price || 0
    const qty = values.quantity || 0
    const payload = {
      ...values,
      purchase_date: values.purchase_date?.format('YYYY-MM-DD'),
      drug_name: drug?.name || '',
      unit: drug?.unit || '克',
      selling_price: drug?.selling_price || 0,
      total_amount: purchasePrice * qty,
    }
    try {
      await request.post('/api/pharmacy/purchases', payload)
      message.success('进货记录已添加')
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e) { /* ignore */ }
  }

  const columns = [
    { title: '进货日期', dataIndex: 'purchase_date', key: 'date', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: '药品名称', dataIndex: 'drug_name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: '数量', dataIndex: 'quantity', key: 'qty' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 50 },
    { title: '进价', dataIndex: 'purchase_price', key: 'pp', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '金额', dataIndex: 'total_amount', key: 'amt', render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '供货单位', dataIndex: 'supplier', key: 'supplier', ellipsis: true },
    { title: '批号', dataIndex: 'batch_no', key: 'batch' },
    { title: '有效期', dataIndex: 'expiry_date', key: 'expiry', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '国药准字', dataIndex: 'approval_number', key: 'approval', ellipsis: true },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        进货管理
      </Title>

      <Card extra={
        <Space>
          <Input.Search placeholder="搜索药品/供货单位/批号" value={keyword}
            onChange={(e) => setKeyword(e.target.value)} onSearch={() => { setPage(1); loadData() }}
            style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true) }}>
            新增进货
          </Button>
        </Space>
      }>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: (t) => `共 ${t} 条记录` }}
          size="small" scroll={{ x: 1100 }} />
      </Card>

      <Modal title="新增进货记录" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="purchase_date" label="进货日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="drug_id" label="药品名称" rules={[{ required: true }]}>
            <Select showSearch placeholder="搜索选择药品" filterOption={(input, option) =>
              (option?.label as string || '').includes(input)} options={drugs.map(d => ({
                label: `${d.name} (库存:${d.stock} 进价:¥${d.purchase_price})`,
                value: d.id,
              }))} onChange={(val) => {
                const drug = drugs.find(d => d.id === val)
                form.setFieldsValue({
                  purchase_price: drug?.purchase_price, drug_name: drug?.name, unit: drug?.unit,
                })
              }} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><InputNumber min={1} style={{ width: 120 }} /></Form.Item>
            <Form.Item name="unit" label="单位"><Input style={{ width: 80 }} /></Form.Item>
            <Form.Item name="purchase_price" label="进价"><InputNumber min={0} step={0.01} style={{ width: 120 }} /></Form.Item>
          </Space>
          <Form.Item name="supplier" label="供货单位"><Input /></Form.Item>
          <Form.Item name="manufacturer" label="生产厂家"><Input /></Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="batch_no" label="批号"><Input style={{ width: 180 }} /></Form.Item>
            <Form.Item name="approval_number" label="国药准字"><Input style={{ width: 200 }} /></Form.Item>
            <Form.Item name="expiry_date" label="有效期"><DatePicker /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
