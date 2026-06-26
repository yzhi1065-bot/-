import React, { useState, useEffect } from 'react'
import {
  Card, Table, Tag, Typography, Space, Button, Row, Col, Statistic,
  Descriptions, Spin, message, Modal, Timeline, Empty, Input, Tooltip
} from 'antd'
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PrinterOutlined, SearchOutlined, CloseCircleOutlined,
  DollarOutlined, AuditOutlined, MedicineBoxOutlined,
  OrderedListOutlined, UserOutlined, CalendarOutlined,
  RightCircleOutlined
} from '@ant-design/icons'
import request from '../services/http'

const { Title, Text } = Typography

// 状态配置
const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  submitted: { color: 'blue', icon: <FileTextOutlined />, label: '已提交' },
  pending_audit: { color: 'orange', icon: <AuditOutlined />, label: '待审核' },
  audited: { color: 'cyan', icon: <CheckCircleOutlined />, label: '已审核' },
  pending_charge: { color: 'gold', icon: <DollarOutlined />, label: '待收费' },
  charged: { color: 'green', icon: <DollarOutlined />, label: '已收费' },
  dispensing: { color: 'purple', icon: <MedicineBoxOutlined />, label: '配药中' },
  dispensed: { color: 'green', icon: <CheckCircleOutlined />, label: '已发药' },
  rejected: { color: 'red', icon: <CloseCircleOutlined />, label: '已驳回' },
}

// 状态流转顺序
const flowOrder = ['submitted', 'pending_audit', 'audited', 'pending_charge', 'charged', 'dispensing', 'dispensed']

const defaultPrescriptions = [
  {
    id: 1, no: 'RX20260001', patient: '张三', doctor: '张医生', date: '2026-06-23',
    herbs: '附子理中汤加减', amount: 156, status: 'charged',
    flow: [
      { status: 'submitted', operator: '张医生', time: '2026-06-23 09:30', note: '处方提交' },
      { status: 'audited', operator: '刘药师', time: '2026-06-23 10:15', note: '审核通过' },
      { status: 'charged', operator: '王收费', time: '2026-06-23 10:30', note: '微信支付' },
    ],
  },
  {
    id: 2, no: 'RX20260002', patient: '李四', doctor: '张医生', date: '2026-06-22',
    herbs: '逍遥散加减', amount: 120, status: 'pending_audit',
    flow: [
      { status: 'submitted', operator: '张医生', time: '2026-06-22 14:30', note: '处方提交' },
    ],
  },
  {
    id: 3, no: 'RX20260003', patient: '王五', doctor: '李医生', date: '2026-06-20',
    herbs: '六味地黄丸加减', amount: 180, status: 'dispensed',
    flow: [
      { status: 'submitted', operator: '李医生', time: '2026-06-20 09:00', note: '处方提交' },
      { status: 'audited', operator: '赵药师', time: '2026-06-20 09:45', note: '审核通过' },
      { status: 'charged', operator: '王收费', time: '2026-06-20 10:00', note: '现金支付' },
      { status: 'dispensed', operator: '周药剂', time: '2026-06-20 10:30', note: '已发药' },
    ],
  },
  {
    id: 4, no: 'RX20260007', patient: '周五', doctor: '赵医生', date: '2026-06-25',
    herbs: '麻黄汤加减', amount: 88, status: 'rejected',
    flow: [
      { status: 'submitted', operator: '赵医生', time: '2026-06-25 11:00', note: '处方提交' },
      { status: 'audited', operator: '刘药师', time: '2026-06-25 11:20', note: '驳回：附子用量超出安全范围，请调整' },
    ],
  },
]

export default function PrescriptionFlowPage() {
  const [prescriptions, setPrescriptions] = useState(defaultPrescriptions)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 86, pendingSign: 3, pendingAudit: 5, monthlyAmount: 8650 })
  const [flowModal, setFlowModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    request.get('/api/prescriptions/flow').then((res: any) => {
      const d = res.data || res
      if (d.list) setPrescriptions(d.list)
      if (d.stats) setStats(d.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // 查看流转记录
  const handleViewFlow = (record: any) => {
    setSelectedPrescription(record)
    setFlowModal(true)
  }

  // 过滤
  const filteredList = prescriptions.filter(r => {
    if (searchText && !r.patient?.includes(searchText) && !r.no?.includes(searchText) && !r.doctor?.includes(searchText)) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  // 判断当前状态在流转中的位置
  const getStatusIndex = (status: string) => {
    if (status === 'rejected') return flowOrder.indexOf('audited')
    return flowOrder.indexOf(status)
  }

  const statusList = ['', ...Object.keys(statusConfig)]

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={4} style={{ fontFamily: '"Noto Serif SC", serif', color: '#8B4513', marginBottom: 16 }}>
          <FileTextOutlined /> 电子处方流转
        </Title>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="处方总数" value={stats.total} suffix="张" /></Card></Col>
          <Col span={6}><Card><Statistic title="待签署" value={stats.pendingSign} suffix="张" valueStyle={{ color: '#E67E22' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="待审核" value={stats.pendingAudit} suffix="张" valueStyle={{ color: '#5B8DEF' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="本月金额" value={stats.monthlyAmount} prefix="¥" valueStyle={{ color: '#27AE60' }} /></Card></Col>
        </Row>

        <Card
          title={
            <Space>
              <OrderedListOutlined />
              <span>处方列表</span>
            </Space>
          }
          extra={
            <Space>
              <Input
                placeholder="搜索患者/处方号/医生"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Button type="primary">签署处方</Button>
            </Space>
          }
        >
          <Table
            dataSource={filteredList}
            rowKey="id"
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="暂无处方记录" /> }}
            columns={[
              { title: '处方号', dataIndex: 'no', key: 'no', width: 120 },
              { title: '患者', dataIndex: 'patient', key: 'patient', width: 90 },
              { title: '医生', dataIndex: 'doctor', key: 'doctor', width: 90 },
              { title: '日期', dataIndex: 'date', key: 'date', width: 110 },
              { title: '方剂', dataIndex: 'herbs', key: 'herbs', ellipsis: true },
              {
                title: '金额', dataIndex: 'amount', key: 'amount', width: 90,
                render: (v: number) => <Text strong>¥{v}</Text>,
              },
              {
                title: '状态', dataIndex: 'status', key: 'status', width: 100,
                render: (v: string) => {
                  const cfg = statusConfig[v]
                  return cfg ? <Tag icon={cfg.icon} color={cfg.color}>{cfg.label}</Tag> : <Tag>{v}</Tag>
                },
              },
              {
                title: '操作', key: 'action', width: 160,
                render: (_: any, r: any) => (
                  <Space>
                    <Button size="small" icon={<PrinterOutlined />}>打印</Button>
                    <Button size="small" icon={<RightCircleOutlined />} onClick={() => handleViewFlow(r)}>
                      流转
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        {/* 处方流转记录 Modal */}
        <Modal
          title={
            <Space>
              <OrderedListOutlined style={{ color: '#5B8DEF' }} />
              <span>处方流转追踪 - {selectedPrescription?.no}</span>
            </Space>
          }
          open={flowModal}
          onCancel={() => setFlowModal(false)}
          footer={<Button onClick={() => setFlowModal(false)}>关闭</Button>}
          width={620}
        >
          {selectedPrescription && (
            <>
              <Descriptions column={2} size="small" bordered style={{ marginBottom: 24 }}>
                <Descriptions.Item label="处方号">{selectedPrescription.no}</Descriptions.Item>
                <Descriptions.Item label="患者">{selectedPrescription.patient}</Descriptions.Item>
                <Descriptions.Item label="医生">{selectedPrescription.doctor}</Descriptions.Item>
                <Descriptions.Item label="日期">{selectedPrescription.date}</Descriptions.Item>
                <Descriptions.Item label="方剂">{selectedPrescription.herbs}</Descriptions.Item>
                <Descriptions.Item label="金额">
                  <Text strong style={{ color: '#E74C3C' }}>¥{selectedPrescription.amount}</Text>
                </Descriptions.Item>
              </Descriptions>

              <Text strong style={{ display: 'block', marginBottom: 16 }}>
                <ClockCircleOutlined /> 状态时间线
              </Text>

              <Timeline
                items={
                  selectedPrescription.status === 'rejected'
                    ? [
                        // 显示正常流程到审核被驳回
                        ...flowOrder.slice(0, getStatusIndex(selectedPrescription.status) + 1).map((s, idx) => {
                          const flowItem = selectedPrescription.flow?.find((f: any) => f.status === s)
                          const cfg = statusConfig[s]
                          // 如果找到对应的 flow 记录
                          if (flowItem) {
                            return {
                              color: 'red',
                              dot: cfg?.icon || <ClockCircleOutlined />,
                              children: (
                                <div>
                                  <div style={{ fontWeight: 500 }}>{cfg?.label || s}</div>
                                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                    <UserOutlined /> {flowItem.operator} &nbsp;
                                    <CalendarOutlined /> {flowItem.time}
                                  </div>
                                  {flowItem.note && (
                                    <div style={{
                                      fontSize: 12, color: '#E74C3C',
                                      background: '#FFF2F0', padding: '4px 8px',
                                      borderRadius: 4, marginTop: 4,
                                    }}>
                                      {flowItem.note}
                                    </div>
                                  )}
                                </div>
                              ),
                            }
                          }
                          // 状态存在但无记录 -> 灰色占位
                          return {
                            color: 'gray',
                            children: (
                              <div>
                                <div style={{ fontWeight: 500, color: '#ccc' }}>{cfg?.label || s}</div>
                                <div style={{ fontSize: 12, color: '#ddd' }}>—</div>
                              </div>
                            ),
                          }
                        }),
                      ]
                    : flowOrder.map((s, idx) => {
                        const flowItem = selectedPrescription.flow?.find((f: any) => f.status === s)
                        const cfg = statusConfig[s]
                        const currentIdx = getStatusIndex(selectedPrescription.status)
                        const isDone = idx <= currentIdx
                        const isCurrent = idx === currentIdx

                        // 找到对应的 flow 记录
                        if (flowItem) {
                          return {
                            color: isCurrent ? 'blue' : 'green',
                            dot: isCurrent ? <RightCircleOutlined style={{ color: '#5B8DEF' }} /> : (cfg?.icon || <ClockCircleOutlined />),
                            children: (
                              <div>
                                <div style={{ fontWeight: isCurrent ? 600 : 400 }}>{cfg?.label || s}</div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                  <UserOutlined /> {flowItem.operator} &nbsp;
                                  <CalendarOutlined /> {flowItem.time}
                                </div>
                                {flowItem.note && (
                                  <div style={{
                                    fontSize: 12, color: '#666',
                                    background: '#F6FFED', padding: '4px 8px',
                                    borderRadius: 4, marginTop: 4,
                                  }}>
                                    {flowItem.note}
                                  </div>
                                )}
                              </div>
                            ),
                          }
                        }

                        // 已完成但无 flow 记录
                        if (isDone) {
                          return {
                            color: 'green',
                            dot: cfg?.icon || <ClockCircleOutlined />,
                            children: (
                              <div>
                                <div style={{ fontWeight: 400 }}>{cfg?.label || s}</div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>已完成</div>
                              </div>
                            ),
                          }
                        }

                        // 待进行
                        return {
                          color: 'gray',
                          children: (
                            <div>
                              <div style={{ fontWeight: 400, color: isCurrent ? '#333' : '#bbb' }}>{cfg?.label || s}</div>
                              <div style={{ fontSize: 12, color: '#ddd' }}>待处理</div>
                            </div>
                          ),
                        }
                      })
                }
              />
            </>
          )}
        </Modal>
      </div>
    </Spin>
  )
}
