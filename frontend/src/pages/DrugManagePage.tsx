import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Input, Space, Tag, Modal, Form, InputNumber, message, Typography, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, DeleteOutlined, DownloadOutlined, ExclamationCircleOutlined, ClearOutlined } from '@ant-design/icons'
import request from '../services/http'
import * as XLSX from 'xlsx'
const { Title, Text } = Typography

export default function DrugManagePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [lowStock, setLowStock] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 20 }
      if (keyword) params.keyword = keyword
      if (lowStock) params.low_stock = true
      console.log('Loading drugs with params:', params)
      const res: any = await request.get('/api/pharmacy/drugs', { params })
      console.log('Drugs response:', res)
      setData(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (e) { /* ignore */ }
    setLoading(false)
  }, [page, keyword, lowStock])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (values: any) => {
    try {
      if (editId) {
        await request.put(`/api/pharmacy/drugs/${editId}`, values)
        message.success('药品已更新')
      } else {
        await request.post('/api/pharmacy/drugs', values)
        message.success('药品已添加')
      }
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (e) { /* ignore */ }
  }

  const handleDelete = async (id: number) => {
    await request.delete(`/api/pharmacy/drugs/${id}`)
    message.success('药品已删除')
    loadData()
  }

  const handleClear = async () => {
    await request.post('/api/pharmacy/drugs/clear')
    message.success('所有药品已清空')
    loadData()
  }

  const handleExport = async () => {
    window.open('/api/pharmacy/drugs/export', '_blank')
    message.success('药品数据导出中')
  }

  const handleImport = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const { read, utils } = XLSX
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = utils.sheet_to_json(sheet)
        await request.post('/api/pharmacy/drugs/import', json)
        message.success(`导入 ${json.length} 种药品成功`)
        loadData()
      } catch { message.error('导入失败，请检查文件格式') }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const openEdit = (record: any) => {
    setEditId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v || '-'}</Tag> },
    { title: '常用量', dataIndex: 'common_dosage', key: 'dosage', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 50 },
    { title: '拼音', dataIndex: 'pinyin', key: 'pinyin', width: 80 },
    { title: '条形码', dataIndex: 'barcode', key: 'barcode', width: 100 },
    { title: '进价', dataIndex: 'purchase_price', key: 'pp', width: 70, render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '售价', dataIndex: 'selling_price', key: 'sp', width: 70, render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 60,
      render: (v: number, r: any) => {
        const alert = r.stock_alert || 10
        return <Tag color={v <= alert ? 'red' : v <= alert * 2 ? 'orange' : 'green'}>{v}</Tag>
      },
    },
    { title: '报警值', dataIndex: 'stock_alert', key: 'alert', width: 60 },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: any, r: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        药品维护
      </Title>

      <Card
        extra={
          <Space wrap>
            <Input.Search placeholder="搜索名称/拼音/分类" value={keyword}
              onChange={(e) => setKeyword(e.target.value)} onSearch={() => { setPage(1); loadData() }}
              style={{ width: 200 }} />
            <Button type={lowStock ? 'primary' : 'default'} icon={<ExclamationCircleOutlined />}
              onClick={() => { setLowStock(!lowStock); setPage(1) }}>
              库存报警
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} id="import-input"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleImport(file); e.target.value = '' } }} />
            <Button icon={<DownloadOutlined />} onClick={() => document.getElementById('import-input')?.click()}>导入</Button>
            <Popconfirm title="确认清空所有药品?" onConfirm={handleClear}>
              <Button icon={<ClearOutlined />} danger>清空</Button>
            </Popconfirm>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditId(null); form.resetFields(); setModalVisible(true) }}>
              添加药品
            </Button>
          </Space>
        }
      >
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: (t) => `共 ${t} 种` }}
          size="small" scroll={{ x: 1000 }} />
      </Card>

      <Modal title={editId ? '编辑药品' : '添加药品'} open={modalVisible}
        onCancel={() => setModalVisible(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="药品名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="category" label="分类"><Input style={{ width: 150 }} /></Form.Item>
            <Form.Item name="pinyin" label="拼音"><Input style={{ width: 150 }} /></Form.Item>
            <Form.Item name="barcode" label="条形码"><Input style={{ width: 160 }} /></Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="common_dosage" label="常用量"><Input style={{ width: 100 }} /></Form.Item>
            <Form.Item name="unit" label="单位" initialValue="克"><Input style={{ width: 80 }} /></Form.Item>
            <Form.Item name="purchase_price" label="进价"><InputNumber min={0} step={0.01} style={{ width: 120 }} /></Form.Item>
            <Form.Item name="selling_price" label="售价"><InputNumber min={0} step={0.01} style={{ width: 120 }} /></Form.Item>
          </Space>
          <Space style={{ width: '100%' }}>
            <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: 120 }} /></Form.Item>
            <Form.Item name="stock_alert" label="库存报警值" initialValue={10}><InputNumber min={0} style={{ width: 120 }} /></Form.Item>
          </Space>
          <Form.Item name="manufacturer" label="生产厂家"><Input /></Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
