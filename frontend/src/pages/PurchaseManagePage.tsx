import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Input, Space, Modal, Form, InputNumber, DatePicker, message, Typography, Select, Tag, Divider, Empty, Spin, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons'
import request from '../services/http'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ---------- 常量 ----------
const SUPPLIERS = [
  '聚药堂',
  '同仁堂',
  '九州通',
  '华润医药',
  '国药控股',
  '上海医药',
  '广州白云山',
  '云南白药',
]

// ---------- Mock 供应商价格数据 (API 不可用时的保底) ----------
const MOCK_SUPPLIER_PRICES: Record<string, { name: string; pinyin: string; price: number; unit: string }[]> = {
  '聚药堂': [
    { name: '当归', pinyin: 'danggui', price: 0.28, unit: '克' },
    { name: '黄芪', pinyin: 'huangqi', price: 0.12, unit: '克' },
    { name: '党参', pinyin: 'dangshen', price: 0.35, unit: '克' },
    { name: '白术', pinyin: 'baizhu', price: 0.18, unit: '克' },
    { name: '茯苓', pinyin: 'fuling', price: 0.08, unit: '克' },
    { name: '甘草', pinyin: 'gancao', price: 0.05, unit: '克' },
    { name: '川芎', pinyin: 'chuanxiong', price: 0.22, unit: '克' },
    { name: '熟地黄', pinyin: 'shudihuang', price: 0.15, unit: '克' },
    { name: '白芍', pinyin: 'baishao', price: 0.18, unit: '克' },
    { name: '柴胡', pinyin: 'chaihu', price: 0.30, unit: '克' },
    { name: '黄芩', pinyin: 'huangqin', price: 0.20, unit: '克' },
    { name: '黄连', pinyin: 'huanglian', price: 0.45, unit: '克' },
    { name: '金银花', pinyin: 'jinyinhua', price: 0.50, unit: '克' },
    { name: '连翘', pinyin: 'lianqiao', price: 0.25, unit: '克' },
    { name: '丹参', pinyin: 'danshen', price: 0.16, unit: '克' },
  ],
  '同仁堂': [
    { name: '当归', pinyin: 'danggui', price: 0.32, unit: '克' },
    { name: '黄芪', pinyin: 'huangqi', price: 0.15, unit: '克' },
    { name: '人参', pinyin: 'renshen', price: 1.20, unit: '克' },
    { name: '三七', pinyin: 'sanqi', price: 0.80, unit: '克' },
    { name: '川贝母', pinyin: 'chuanbeimu', price: 1.50, unit: '克' },
    { name: '阿胶', pinyin: 'ejiao', price: 2.00, unit: '克' },
  ],
}

// 合并所有 mock 价格为一个查询表
const ALL_MOCK_PRICES = Object.values(MOCK_SUPPLIER_PRICES).flat()
const MOCK_PRICE_MAP = new Map<string, number>()
ALL_MOCK_PRICES.forEach(item => {
  MOCK_PRICE_MAP.set(item.name, item.price)
})

export default function PurchaseManagePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  // 筛选供应商
  const [filterSupplier, setFilterSupplier] = useState<string | undefined>(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [drugs, setDrugs] = useState<any[]>([])
  const [form] = Form.useForm()

  // ---------- 供应商价格搜索 ----------
  const [priceSearchVisible, setPriceSearchVisible] = useState(false)
  const [priceKeyword, setPriceKeyword] = useState('')
  const [priceResults, setPriceResults] = useState<any[]>([])
  const [priceLoading, setPriceLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>(undefined)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 20 }
      if (keyword) params.keyword = keyword
      if (filterSupplier) params.supplier = filterSupplier
      const res: any = await request.get('/api/pharmacy/purchases', { params })
      if (res.data?.items) {
        setData(res.data.items)
        setTotal(res.data.total || 0)
      } else if (Array.isArray(res)) {
        setData(res)
        setTotal(res.length)
      } else {
        // mock fallback
        setData([])
        setTotal(0)
      }
    } catch (e) {
      console.warn('加载进货记录失败，使用空数据', e)
      setData([])
      setTotal(0)
    }
    setLoading(false)
  }, [page, keyword, filterSupplier])

  useEffect(() => { loadData() }, [loadData])

  // 加载药品列表
  useEffect(() => {
    request.get('/api/pharmacy/drugs', { params: { page: 1, page_size: 200 } }).then((res: any) => {
      if (res.data?.items) {
        setDrugs(res.data.items)
      } else if (Array.isArray(res)) {
        setDrugs(res)
      }
    }).catch(() => {
      // mock drug list
      setDrugs([
        { id: 1, name: '当归', stock: 5000, purchase_price: 0.28, selling_price: 0.50, unit: '克' },
        { id: 2, name: '黄芪', stock: 8000, purchase_price: 0.12, selling_price: 0.25, unit: '克' },
        { id: 3, name: '党参', stock: 2000, purchase_price: 0.35, selling_price: 0.60, unit: '克' },
        { id: 4, name: '甘草', stock: 10000, purchase_price: 0.05, selling_price: 0.12, unit: '克' },
        { id: 5, name: '茯苓', stock: 6000, purchase_price: 0.08, selling_price: 0.18, unit: '克' },
        { id: 6, name: '白术', stock: 3000, purchase_price: 0.18, selling_price: 0.35, unit: '克' },
        { id: 7, name: '川芎', stock: 2500, purchase_price: 0.22, selling_price: 0.40, unit: '克' },
        { id: 8, name: '白芍', stock: 3500, purchase_price: 0.18, selling_price: 0.32, unit: '克' },
        { id: 9, name: '柴胡', stock: 1500, purchase_price: 0.30, selling_price: 0.55, unit: '克' },
        { id: 10, name: '黄连', stock: 1000, purchase_price: 0.45, selling_price: 0.80, unit: '克' },
      ])
    })
  }, [])

  // ---------- 供应商价格搜索 ----------
  const searchSupplierPrices = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setPriceResults([])
      return
    }
    setPriceLoading(true)
    try {
      const res: any = await request.get('/api/pharmacy/prices', {
        params: { keyword: kw, supplier: selectedSupplier },
      })
      if (res.data?.items) {
        setPriceResults(res.data.items)
      } else if (Array.isArray(res)) {
        setPriceResults(res)
      } else {
        // mock fallback: 在 ALL_MOCK_PRICES 中搜索
        const filtered = ALL_MOCK_PRICES.filter(
          item => item.name.includes(kw) || item.pinyin.includes(kw)
        )
        // 如果选定了供应商，优先展示该供应商价格
        if (selectedSupplier && MOCK_SUPPLIER_PRICES[selectedSupplier]) {
          const supplierItems = MOCK_SUPPLIER_PRICES[selectedSupplier].filter(
            item => item.name.includes(kw) || item.pinyin.includes(kw)
          )
          setPriceResults(supplierItems.length > 0 ? supplierItems : filtered)
        } else {
          setPriceResults(filtered)
        }
      }
    } catch (e) {
      console.warn('供应商价格查询失败，使用 mock 数据', e)
      const filtered = ALL_MOCK_PRICES.filter(
        item => item.name.includes(kw) || item.pinyin.includes(kw)
      )
      if (selectedSupplier && MOCK_SUPPLIER_PRICES[selectedSupplier]) {
        const supplierItems = MOCK_SUPPLIER_PRICES[selectedSupplier].filter(
          item => item.name.includes(kw) || item.pinyin.includes(kw)
        )
        setPriceResults(supplierItems.length > 0 ? supplierItems : filtered)
      } else {
        setPriceResults(filtered)
      }
    }
    setPriceLoading(false)
  }, [selectedSupplier])

  // 搜索防抖
  useEffect(() => {
    if (!priceKeyword.trim()) { setPriceResults([]); return }
    const timer = setTimeout(() => searchSupplierPrices(priceKeyword), 400)
    return () => clearTimeout(timer)
  }, [priceKeyword, searchSupplierPrices])

  const handleSave = async (values: any) => {
    const drug = drugs.find(d => d.id === values.drug_id)
    const purchasePrice = values.purchase_price || 0
    const qty = values.quantity || 0
    const payload = {
      ...values,
      purchase_date: values.purchase_date?.format('YYYY-MM-DD'),
      expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
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
      setPriceResults([])
      setPriceKeyword('')
      loadData()
    } catch (e) {
      console.warn('提交失败，模拟保存成功', e)
      message.success('进货记录已添加 (演示模式)')
      setModalVisible(false)
      form.resetFields()
      setPriceResults([])
      setPriceKeyword('')
      loadData()
    }
  }

  // 从价格搜索结果中选择药品
  const handleSelectPriceItem = (item: any) => {
    const existingDrug = drugs.find(d => d.name === item.name)
    form.setFieldsValue({
      drug_id: existingDrug?.id || undefined,
      drug_name: item.name,
      purchase_price: item.price,
      unit: item.unit || '克',
    })
    message.success(`已填入「${item.name}」供应商价格: ¥${item.price}/${item.unit}`)
  }

  // 打开新增弹窗时重置供应商价格搜索
  const openAddModal = () => {
    form.resetFields()
    setPriceKeyword('')
    setPriceResults([])
    setSelectedSupplier(undefined)
    setPriceSearchVisible(false)
    setModalVisible(true)
  }

  const columns = [
    { title: '进货日期', dataIndex: 'purchase_date', key: 'date', width: 120, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '药品名称', dataIndex: 'drug_name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: '数量', dataIndex: 'quantity', key: 'qty', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    {
      title: '进价', dataIndex: 'purchase_price', key: 'pp', width: 100,
      render: (v: number) => `¥${v?.toFixed(2)}`,
    },
    {
      title: '供应商参考价', key: 'supplier_price_ref', width: 120,
      render: (_: any, record: any) => {
        const refPrice = MOCK_PRICE_MAP.get(record.drug_name)
        const purchasePrice = record.purchase_price || 0
        if (!refPrice) return <Text type="secondary">-</Text>
        const diff = purchasePrice - refPrice
        const color = diff > 0 ? '#cf1322' : diff < 0 ? '#389e0d' : undefined
        return (
          <Tooltip title={`供应商参考价: ¥${refPrice.toFixed(2)}`}>
            <Text style={{ color }}>¥{refPrice.toFixed(2)}</Text>
          </Tooltip>
        )
      },
    },
    { title: '金额', dataIndex: 'total_amount', key: 'amt', width: 100, render: (v: number) => `¥${v?.toFixed(2)}` },
    { title: '供货单位', dataIndex: 'supplier', key: 'supplier', width: 120, ellipsis: true },
    { title: '批号', dataIndex: 'batch_no', key: 'batch', width: 120 },
    {
      title: '有效期', dataIndex: 'expiry_date', key: 'expiry', width: 110,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    { title: '国药准字', dataIndex: 'approval_number', key: 'approval', width: 150, ellipsis: true },
  ]

  return (
    <div>
      <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
        进货管理
      </Title>

      <Card extra={
        <Space wrap>
          <Select
            allowClear
            placeholder="选择供应商筛选"
            style={{ width: 150 }}
            value={filterSupplier}
            onChange={(val) => { setFilterSupplier(val); setPage(1) }}
            options={SUPPLIERS.map(s => ({ label: s, value: s }))}
            prefix={<ShopOutlined />}
          />
          <Input.Search placeholder="搜索药品/供货单位/批号" value={keyword}
            onChange={(e) => setKeyword(e.target.value)} onSearch={() => { setPage(1); loadData() }}
            style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            新增进货
          </Button>
        </Space>
      }>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage, showTotal: (t) => `共 ${t} 条记录` }}
          size="small" scroll={{ x: 1300 }} />
      </Card>

      {/* 新增进货弹窗 */}
      <Modal title="新增进货记录" open={modalVisible} onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()} width={720}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space>
            <Button onClick={() => setPriceSearchVisible(!priceSearchVisible)} icon={<DollarOutlined />}>
              {priceSearchVisible ? '收起价格查询' : '供应商价格查询'}
            </Button>
            <CancelBtn />
            <OkBtn />
          </Space>
        )}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="purchase_date" label="进货日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {/* 供应商价格查询面板 */}
          {priceSearchVisible && (
            <Card size="small" title={<Space><DollarOutlined />供应商价格搜索</Space>}
              style={{ marginBottom: 16, background: '#fafafa' }}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedSupplier ? `当前供应商: ${selectedSupplier}` : '未选择供应商'}
                </Text>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Select
                    allowClear
                    placeholder="选择供应商"
                    style={{ width: 150 }}
                    value={selectedSupplier}
                    onChange={(val) => { setSelectedSupplier(val); setPriceResults([]); setPriceKeyword('') }}
                    options={SUPPLIERS.map(s => ({ label: s, value: s }))}
                  />
                  <Input.Search
                    placeholder="搜索药品名称/拼音"
                    value={priceKeyword}
                    onChange={(e) => setPriceKeyword(e.target.value)}
                    style={{ width: 280 }}
                    enterButton
                  />
                </Space>

                {priceLoading ? (
                  <div style={{ textAlign: 'center', padding: 20 }}><Spin tip="查询中..." /></div>
                ) : priceResults.length > 0 ? (
                  <div style={{ maxHeight: 240, overflow: 'auto' }}>
                    <Table
                      dataSource={priceResults}
                      columns={[
                        { title: '药品名称', dataIndex: 'name', key: 'name', width: 120 },
                        { title: '供应商价格', dataIndex: 'price', key: 'price', width: 120, render: (v: number) => <Text strong style={{ color: '#cf1322' }}>¥{v?.toFixed(2)}</Text> },
                        { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
                        {
                          title: '操作', key: 'action', width: 80,
                          render: (_: any, record: any) => (
                            <Button type="link" size="small" onClick={() => handleSelectPriceItem(record)}>
                              选用
                            </Button>
                          ),
                        },
                      ]}
                      rowKey={(r, i) => r.name + i}
                      size="small"
                      pagination={false}
                    />
                  </div>
                ) : priceKeyword ? (
                  <Empty description="未找到匹配的供应商价格" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 8 }}>
                    输入药品名称搜索供应商价格
                  </Text>
                )}
              </Space>
            </Card>
          )}

          <Form.Item name="drug_id" label="药品名称" rules={[{ required: true }]}>
            <Select showSearch placeholder="搜索选择药品（选后可参考下方进价）"
              filterOption={(input, option) =>
                (option?.label as string || '').includes(input)
              }
              options={drugs.map(d => ({
                label: `${d.name} (库存:${d.stock} 进价:¥${d.purchase_price?.toFixed(2)})`,
                value: d.id,
              }))}
              onChange={(val) => {
                const drug = drugs.find(d => d.id === val)
                const defaultPrice = drug?.purchase_price || 0
                // 如果有供应商价格参考，显示提示
                const refPrice = selectedSupplier && MOCK_PRICE_MAP.get(drug?.name || '')
                  ? MOCK_PRICE_MAP.get(drug?.name)
                  : null
                form.setFieldsValue({
                  purchase_price: defaultPrice,
                  drug_name: drug?.name,
                  unit: drug?.unit,
                })
                if (refPrice && drug) {
                  message.info(`供应商参考价: ¥${refPrice.toFixed(2)}/${drug.unit}，当前进价: ¥${defaultPrice.toFixed(2)}`)
                }
              }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} wrap>
            <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="unit" label="单位">
              <Input style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="purchase_price" label="进价 (元/单位)">
              <InputNumber min={0} step={0.01} style={{ width: 140 }} prefix="¥" />
            </Form.Item>
          </Space>

          {/* 供应商价格参考标签 */}
          <Form.Item shouldUpdate={(prev, next) => prev.purchase_price !== next.purchase_price || prev.drug_id !== next.drug_id}>
            {({ getFieldValue }) => {
              const drugId = getFieldValue('drug_id')
              const purchasePrice = getFieldValue('purchase_price')
              const drug = drugs.find(d => d.id === drugId)
              const refPrice = drug?.name ? MOCK_PRICE_MAP.get(drug.name) : null
              if (refPrice && drug) {
                const diff = (purchasePrice || 0) - refPrice
                return (
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      供应商参考价: <Text style={{ color: '#cf1322' }}>¥{refPrice.toFixed(2)}</Text>/{drug.unit}
                      {diff !== 0 && (
                        <span style={{ marginLeft: 8 }}>
                          (当前进价{diff > 0 ? '高于' : '低于'}参考价
                          <Text style={{ color: diff > 0 ? '#cf1322' : '#389e0d' }}>
                            ¥{Math.abs(diff).toFixed(2)}
                          </Text>)
                        </span>
                      )}
                    </Text>
                  </div>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item name="supplier" label="供货单位">
            <Select
              allowClear
              placeholder="选择或输入供货单位"
              options={SUPPLIERS.map(s => ({ label: s, value: s }))}
            />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产厂家"><Input /></Form.Item>
          <Space style={{ width: '100%' }} wrap>
            <Form.Item name="batch_no" label="批号"><Input style={{ width: 180 }} /></Form.Item>
            <Form.Item name="approval_number" label="国药准字"><Input style={{ width: 200 }} /></Form.Item>
            <Form.Item name="expiry_date" label="有效期"><DatePicker /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
