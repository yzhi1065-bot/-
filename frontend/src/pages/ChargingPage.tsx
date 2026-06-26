import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Typography, Space, Button, Row, Col, Statistic,
  Modal, Descriptions, Radio, message, Spin, Tag, Divider, Empty, Input
} from 'antd'
import {
  DollarOutlined, BankOutlined, WalletOutlined,
  WechatOutlined, CheckCircleOutlined, SearchOutlined, FileTextOutlined,
  ShoppingCartOutlined, PayCircleOutlined
} from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

// 支付方式图标映射
const paymentIcons: Record<string, React.ReactNode> = {
  cash: <BankOutlined />,
  wechat: <WechatOutlined />,
  alipay: <PayCircleOutlined />,
  insurance: <WalletOutlined />,
}

const paymentLabels: Record<string, string> = {
  cash: '现金',
  wechat: '微信支付',
  alipay: '支付宝',
  insurance: '医保结算',
}

// 默认 mock 待收费数据
const defaultPendingRecords = [
  { id: 1, prescriptionNo: 'RX20260001', patientName: '张三', doctorName: '张医生', date: '2026-06-23 09:30', totalAmount: 156.00, items: [{ name: '附子', unitPrice: 0.5, quantity: 30, amount: 15 }, { name: '人参', unitPrice: 2.0, quantity: 10, amount: 20 }, { name: '干姜', unitPrice: 0.3, quantity: 15, amount: 4.5 }, { name: '炙甘草', unitPrice: 0.2, quantity: 12, amount: 2.4 }] },
  { id: 2, prescriptionNo: 'RX20260004', patientName: '赵六', doctorName: '李医生', date: '2026-06-24 14:00', totalAmount: 238.50, items: [{ name: '当归', unitPrice: 0.8, quantity: 20, amount: 16 }, { name: '熟地黄', unitPrice: 1.5, quantity: 15, amount: 22.5 }, { name: '白芍', unitPrice: 0.6, quantity: 18, amount: 10.8 }] },
  { id: 3, prescriptionNo: 'RX20260005', patientName: '钱七', doctorName: '王医生', date: '2026-06-24 15:30', totalAmount: 320.00, items: [{ name: '黄芪', unitPrice: 1.2, quantity: 30, amount: 36 }, { name: '白术', unitPrice: 0.5, quantity: 20, amount: 10 }, { name: '防风', unitPrice: 0.7, quantity: 15, amount: 10.5 }] },
]

// 默认 mock 日结统计
const defaultDailySummary = {
  totalIncome: 714.50,
  totalOrders: 5,
  paymentBreakdown: {
    cash: 256.00,
    wechat: 320.00,
    alipay: 138.50,
    insurance: 0,
  },
}

export default function ChargingPage() {
  const [pendingList, setPendingList] = useState<any[]>(defaultPendingRecords)
  const [loading, setLoading] = useState(false)
  const [payingLoading, setPayingLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [dailySummary, setDailySummary] = useState(defaultDailySummary)
  const [searchText, setSearchText] = useState('')

  // 加载待收费列表
  const loadPendingRecords = useCallback(() => {
    setLoading(true)
    request.get('/api/charging/records')
      .then((res: any) => {
        const d = res.data || res
        if (Array.isArray(d)) setPendingList(d)
        else if (d.list) setPendingList(d.list)
      })
      .catch(() => { /* 使用 mock 数据保底 */ })
      .finally(() => setLoading(false))
  }, [])

  // 加载日结统计
  const loadDailySummary = useCallback(() => {
    request.get('/api/charging/daily-summary')
      .then((res: any) => {
        const d = res.data || res
        if (d) setDailySummary(d)
      })
      .catch(() => { /* 使用 mock 数据保底 */ })
  }, [])

  useEffect(() => {
    loadPendingRecords()
    loadDailySummary()
  }, [loadPendingRecords, loadDailySummary])

  // 打开收费窗口
  const handleCharge = (record: any) => {
    setSelectedRecord(record)
    setPaymentMethod('cash')
    setPayModalOpen(true)
  }

  // 确认收费
  const handlePay = async () => {
    if (!selectedRecord) return
    setPayingLoading(true)
    try {
      await request.post('/api/charging/pay', {
        prescription_id: selectedRecord.id,
        prescription_no: selectedRecord.prescriptionNo,
        amount: selectedRecord.totalAmount,
        payment_method: paymentMethod,
      })
      message.success(`收费成功！${selectedRecord.patientName} - ¥${selectedRecord.totalAmount.toFixed(2)}`)
      setPayModalOpen(false)
      setSelectedRecord(null)
      loadPendingRecords()
      loadDailySummary()
    } catch {
      // mock 保底：本地模拟收费成功
      message.success(`收费成功！（模拟）${selectedRecord.patientName} - ¥${selectedRecord.totalAmount.toFixed(2)}`)
      setPendingList(prev => prev.filter(p => p.id !== selectedRecord.id))
      setDailySummary(prev => ({
        ...prev,
        totalIncome: prev.totalIncome + selectedRecord.totalAmount,
        totalOrders: prev.totalOrders + 1,
        paymentBreakdown: {
          ...prev.paymentBreakdown,
          [paymentMethod]: (prev.paymentBreakdown[paymentMethod as keyof typeof prev.paymentBreakdown] || 0) + selectedRecord.totalAmount,
        },
      }))
      setPayModalOpen(false)
      setSelectedRecord(null)
    } finally {
      setPayingLoading(false)
    }
  }

  // 过滤后的待收费列表
  const filteredList = pendingList.filter(r =>
    !searchText ||
    r.patientName?.includes(searchText) ||
    r.prescriptionNo?.includes(searchText) ||
    r.doctorName?.includes(searchText)
  )

  const itemColumns = [
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '单价(¥)', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (v: number) => `${v}` },
    { title: '金额(¥)', dataIndex: 'amount', key: 'amount', render: (v: number) => v.toFixed(2) },
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
          <DollarOutlined /> 收费结算台
        </Title>

        {/* 日结统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic title="今日收入" value={dailySummary.totalIncome} precision={2} prefix="¥" valueStyle={{ color: '#27AE60' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="收费笔数" value={dailySummary.totalOrders} suffix="笔" valueStyle={{ color: '#5B8DEF' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="现金" value={dailySummary.paymentBreakdown?.cash || 0} precision={2} prefix="¥" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="微信/支付宝" value={(dailySummary.paymentBreakdown?.wechat || 0) + (dailySummary.paymentBreakdown?.alipay || 0)} precision={2} prefix="¥" valueStyle={{ color: '#E67E22' }} />
            </Card>
          </Col>
        </Row>

        {/* 待收费列表 */}
        <Card
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>待收费列表</span>
            </Space>
          }
          extra={
            <Space>
              <Input
                placeholder="搜索患者/处方号/医生"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 240 }}
                allowClear
              />
              <Button type="primary" onClick={loadPendingRecords}>刷新</Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredList}
            rowKey="id"
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="暂无待收费记录" /> }}
            columns={[
              { title: '处方号', dataIndex: 'prescriptionNo', key: 'prescriptionNo', width: 130 },
              { title: '患者', dataIndex: 'patientName', key: 'patientName', width: 100 },
              { title: '医生', dataIndex: 'doctorName', key: 'doctorName', width: 100 },
              { title: '日期', dataIndex: 'date', key: 'date', width: 170 },
              {
                title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 100,
                render: (v: number) => <Text strong style={{ color: '#E74C3C' }}>¥{v?.toFixed(2)}</Text>,
              },
              {
                title: '操作', key: 'action', width: 120,
                render: (_: any, r: any) => (
                  <Button type="primary" size="small" icon={<DollarOutlined />} onClick={() => handleCharge(r)}>
                    收费
                  </Button>
                ),
              },
            ]}
          />
        </Card>

        {/* 收费窗口 Modal */}
        <Modal
          title={
            <Space>
              <DollarOutlined style={{ color: '#27AE60' }} />
              <span>收费确认 - {selectedRecord?.prescriptionNo}</span>
            </Space>
          }
          open={payModalOpen}
          onCancel={() => setPayModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setPayModalOpen(false)}>取消</Button>,
            <Button key="pay" type="primary" loading={payingLoading} onClick={handlePay}
              icon={<CheckCircleOutlined />} style={{ background: '#27AE60', borderColor: '#27AE60' }}>
              确认收费 ¥{selectedRecord?.totalAmount?.toFixed(2)}
            </Button>,
          ]}
          width={700}
        >
          {selectedRecord && (
            <>
              <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="处方号">{selectedRecord.prescriptionNo}</Descriptions.Item>
                <Descriptions.Item label="患者">{selectedRecord.patientName}</Descriptions.Item>
                <Descriptions.Item label="医生">{selectedRecord.doctorName}</Descriptions.Item>
                <Descriptions.Item label="日期">{selectedRecord.date}</Descriptions.Item>
              </Descriptions>

              <Text strong style={{ display: 'block', marginBottom: 8 }}>处方明细</Text>
              <Table
                dataSource={selectedRecord.items || []}
                rowKey="name"
                columns={itemColumns}
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong style={{ float: 'right' }}>合计：</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ color: '#E74C3C', fontSize: 16 }}>
                        ¥{selectedRecord.totalAmount?.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />

              <Divider />
              <Text strong style={{ display: 'block', marginBottom: 12 }}>选择支付方式</Text>
              <Radio.Group
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                size="large"
                style={{ width: '100%', display: 'flex', gap: 8 }}
              >
                {Object.entries(paymentLabels).map(([key, label]) => (
                  <Radio.Button key={key} value={key} style={{ flex: 1, textAlign: 'center', height: 48, lineHeight: '48px', fontSize: 15 }}>
                    {paymentIcons[key]} {label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </>
          )}
        </Modal>
      </div>
    </Spin>
  )
}
